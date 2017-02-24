var config = {};

// kinesis defaults
config.kinesis = {
  endpoint: 'kinesis.us-east-1.amazonaws.com',
  region: 'us-east-1'
};

// kinesis stream to listen to
config.kinesisStreamNameIn = 'IndexDocumentQueue';

// kinesis stream to post to
config.kinesisStreamNameOut = 'IndexDocument';

// field to group records by
config.groupByField = 'id';

// TODO: delay time in milliseconds (-1 for no delay)
config.delay = -1;

// TODO: minimum number of records before aggregating and posting downstream (-1 for no minumum)
config.minRecordsToAggregate = -1;

module.exports = config;
