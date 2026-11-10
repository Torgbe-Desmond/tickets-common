import { jetstream, StorageType } from "@nats-io/jetstream";
import type { NatsConnection } from "@nats-io/nats-core";
import type { JetStreamManager } from "@nats-io/jetstream";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;  
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  abstract streamName: string;

  constructor(
    protected nc: NatsConnection,
    protected jsm: JetStreamManager,
  ) {}

  async setup() {
    const streamConfig = {
      name: this.streamName,
      subjects: [this.subject],
      storage: StorageType.File,
    };

    try {
      await this.jsm.streams.add(streamConfig);
    } catch {
      // Stream exists with a different config
      await this.jsm.streams.update(streamConfig.name, {
        subjects: streamConfig.subjects,
      });
    }
  }

  async publish(data: T["data"]): Promise<void> {
    await this.setup();

    const js = jetstream(this.nc);
    const ack = await js.publish(this.subject, JSON.stringify(data));
    console.log(`stored in stream ${ack.stream} at sequence ${ack.seq}`);
  }
}