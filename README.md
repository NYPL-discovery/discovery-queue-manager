# Discovery Queue Manager (DEPRECATED)

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

`npm install`

## Setup

Copy `event.sample.json` data into `event.json`. It's encoded with avro schema in base64, but will eventually resolve to something like this:

```
{"uri":"doc1","type":"test"}
{"uri":"doc2","type":"test"}
{"uri":"doc2","type":"test"}
{"uri":"doc3","type":"test"}
{"uri":"doc3","type":"test"}
{"uri":"doc3","type":"test"}
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

`npm run deploy-[qa|production]`
