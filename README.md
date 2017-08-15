# Discovery Queue Manager

Listens to a queue of documents from a stream, batches them, and sends them down-stream.

## Streaming contract

Expects data like this from stream `IndexDocumentQueue` (using [this avro schema](avro-schema.js)):

```
<avro encoded> {"uri":"doc1","type":"test"}
<avro encoded> {"uri":"doc2","type":"test"}
<avro encoded> {"uri":"doc2","type":"test"}
<avro encoded> {"uri":"doc3","type":"test"}
<avro encoded> {"uri":"doc3","type":"test"}
<avro encoded> {"uri":"doc3","type":"test"}
```

Unique document URIs will be passed along down-stream to stream `IndexDocument` and looks like this (using [this avro schema](avro-schema.js)):

```
<avro encoded> {"uri":"doc1","type":"test"}
<avro encoded> {"uri":"doc2","type":"test"}
<avro encoded> {"uri":"doc3","type":"test"}
```

## Installation

```
npm install
npm install -g node-lambda
```

## Setup

```
node-lambda setup
```

Copy `event.sample.json` data into `event.json`. It's encoded with avro schema in base64, but will eventually resolve to something like this:

```
{"uri":"doc1","type":"test"}
{"uri":"doc2","type":"test"}
{"uri":"doc2","type":"test"}
{"uri":"doc3","type":"test"}
{"uri":"doc3","type":"test"}
{"uri":"doc3","type":"test"}
```

Fill in credentials in `.env` file to write to stream. At least these:

```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_ROLE_ARN=xxx
```

## Run test

```
node-lambda run
```

Should produce data like this to the output stream (using [this avro schema](avro-schema.js)):

```
<avro encoded> {"uri":"doc1","type":"test"}
<avro encoded> {"uri":"doc2","type":"test"}
<avro encoded> {"uri":"doc3","type":"test"}
```

## Deploy

Update `deploy[.environment].env` with at least these:

```
KINESIS_STREAM_NAME_OUT=IndexDocument[-environmnet]
GROUP_BY_FIELD=uri
```

Then run:

```
node-lambda deploy --functionName manageDocumentQueue --environment production --configFile deploy[.environment].env
```

Will deploy to a Lambda called `manageDocumentQueue-production`. Add a Kinesis stream trigger to execute function if not already added.
