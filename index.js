console.log('Loading Discovery Queue Manager');

var aws = require('aws-sdk');
var _ = require('lodash');
var config = require('./config.js');

// kinesis stream handler
exports.kinesisHandler = function(records, context) {
  console.log('Processing ' + records.length + ' records');

  // process kinesis records
  var data = records
    .map(function(record) {
      return new Buffer(record.kinesis.data, 'base64').toString('utf8');
    })
    .map(parseData);

  // aggregate data
  var aggData = _.chain(data)
    .groupBy(config.groupByField)
    .toPairs()
    .map(aggregateData)
    .value();

  // to kinesis data
  var kinesisData = aggData
    .map(kinesisify)

  // post data to stream
  postData(kinesisData);

  // aggregate group
  function aggregateData(entryPair) {
    var groupId = entryPair[0];
    var groupItems = entryPair[1];
    var firstItem = {};
    if (groupItems.length > 0) {
      firstItem = groupItems[0];
    }
    var timestamp = new Date().toISOString();
    var size = groupItems.length;
    // should have at least an id and timestamp
    var entry = _.assign({}, firstItem, {'id': groupId, 'timestamp': timestamp, 'size': size});
    return entry;
  }

  // unique partition key
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  // map to records objects as needed
  function kinesisify(entry) {
    var data = JSON.stringify(entry);
    var partitionKey = 'pk-' + guid();
    var streamName = config.kinesisStreamNameOut;
    var kinesisRecord = {
      'Data': data,
      'PartitionKey': partitionKey,
      'StreamName': streamName
    }
    return kinesisRecord;
  }

  // map to records objects as needed
  function parseData(payload) {
    var record = JSON.parse(payload);
    return record;
  }

  // post data to kinesis
  function postData(records) {
    console.log('Writing ' + records.length + ' unique records to stream');

    // init kinesis
    var kinesis = new aws.Kinesis();
    kinesis.config.region = config.kinesis.region;
    kinesis.config.endpoint = config.kinesis.endpoint;
    kinesis.region = config.kinesis.region;
    kinesis.endpoint = config.kinesis.endpoint;

    _.forEach(records, function(record) {
      kinesis.putRecord(record, function(err, data) {
        if (err) console.log(err);
      });
    });
  }

  context.done();
};

// main function
exports.handler = function(event, context) {
  var record = event.Records[0];
  if (record.kinesis) {
    exports.kinesisHandler(event.Records, context);
  }
};
