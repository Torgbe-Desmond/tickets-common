# Common Library

Shared library for microservices containing:

- Custom error classes
- Express middlewares (`currentUser`, `requireAuth`, `validateRequest`, `errorHandler`)
- NATS Streaming event base classes and event interfaces

## Setup

```bash
npm install
npm run build
```

## Usage in other services

Link it locally while developing:

```bash
# Inside this common package
npm run build
npm link

# Inside each service that uses it
npm link @your-org/common
```

Or publish to npm (or a private registry) and install normally.

## Notes about compatibility

- `express-validator` v7 changed the shape of `ValidationError` slightly.
  The original course code used `err.param`. In newer versions you may need `err.path` or a type assertion.
- `node-nats-streaming` is deprecated. For new projects consider migrating to NATS JetStream, but this package keeps the original API so the course code continues to work.
- Make sure `JWT_KEY` is set in the environment for the `currentUser` middleware.
