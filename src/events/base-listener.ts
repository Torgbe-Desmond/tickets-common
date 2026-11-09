import { nanos } from "@nats-io/nats-core";
import type { NatsConnection } from "@nats-io/nats-core";
import { jetstream, AckPolicy, DeliverPolicy } from "@nats-io/jetstream";
import type { JetStreamManager, JsMsg } from "@nats-io/jetstream";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract durableName: string;
  abstract streamName: string;
  abstract onMessage(data: T["data"], msg: JsMsg): void | Promise<void>;

  protected ackWait = 5 * 1000;

  constructor(
    protected nc: NatsConnection,
    protected jsm: JetStreamManager,
  ) {}

  private async setupConsumer() {
    await this.jsm.consumers.add(this.streamName, {
      durable_name: this.durableName,
      filter_subject: this.subject,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      ack_wait: nanos(this.ackWait),
    });
  }

  async listen() {
    await this.setupConsumer();

    const js = jetstream(this.nc);
    const consumer = await js.consumers.get(this.streamName, this.durableName);
    const messages = await consumer.consume();

    console.log(`[${this.durableName}] listening on ${this.subject}`);

    for await (const m of messages) {
      console.log(`Message #${m.seq} received on ${m.subject}`);
      await this.onMessage(m.json<T>(), m);
    }
  }
}
