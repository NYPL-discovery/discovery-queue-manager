# Discovery Queue Manager

Listens to a queue of documents from a stream, batches them, and sends them down-stream.

## Installation

 ```
 npm install
 npm install -g node-lambda
 ```

## Setup

```
node-lambda setup
```

Copy `event.sample.json` data into `event.json`. It's encoded in base64, but will eventually resolve to something like this:

```
{"id":"doc1","type":"test","timestamp":"2017-01-01T12:00:00.000000"}
{"id":"doc2","type":"test","timestamp":"2017-01-01T12:00:00.000000"}
{"id":"doc2","type":"test","timestamp":"2017-01-01T12:00:00.000000"}
{"id":"doc3","type":"test","timestamp":"2017-01-01T12:00:00.000000"}
{"id":"doc3","type":"test","timestamp":"2017-01-01T12:00:00.000000"}
{"id":"doc3","type":"test","timestamp":"2017-01-01T12:00:00.000000"}
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

Should produce data like this to the output stream:

```
{"id":"doc1","type":"test","timestamp":"2017-01-01T12:00:00.000000","size":1}
{"id":"doc2","type":"test","timestamp":"2017-01-01T12:00:00.000000","size":2}
{"id":"doc3","type":"test","timestamp":"2017-01-01T12:00:00.000000","size":3}
```

Verify data stream TODO

## Deploy

TODO
