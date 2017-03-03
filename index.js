console.log('Loading Discovery Queue Manager');

var avro = require('avsc');
var aws = require('aws-sdk');
var _ = require('lodash');
var config = require('./config.js');
var schema = require('./avro-schema.js');

// kinesis stream handler
exports.kinesisHandler = function(records, context) {
  console.log('Processing ' + records.length + ' records');

  // initialize avro schema
  const type = avro.parse(schema);

  // var entry = {type: "test", uri: "doc1"};
  // var buf = type.toBuffer(entry);
  // var encoded = buf.toString('base64');
  // var decoded = new Buffer(encoded, 'base64');
  // var verify = type.fromBuffer(decoded);
  // console.log('Encoded: ' + encoded);
  // console.log('Decoded: ' + verify);

  // process kinesis records
  var data = records
    .map(function(record) {
      return new Buffer(record.kinesis.data, 'base64');
    })
    .map(parseData);

  // aggregate data
  var aggData = _.chain(data)
    .groupBy(config.groupByField)
    .toPairs()
    .filter(function(pair){ return pair[1] && pair[1].length; })
    .map(aggregateData)
    .value();

  // to avro/kinesis data
  var kinesisData = aggData
    .map(avroify)
    .map(kinesisify)

  // post data to stream
  postData(kinesisData);

  // aggregate group
  function aggregateData(entryPair) {
    var groupItems = entryPair[1];
    var firstItem = groupItems[0];
    var entry = {};
    _.forEach(schema.fields, function(field) {
      entry[field.name] = firstItem[field.name];
    });
    return entry;
  }

  // unique partition key
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  function avroify(entry){
    return type.toBuffer(entry);
  }

  // map to records objects as needed
  function kinesisify(entry) {
    var partitionKey = 'pk-' + guid();
    var streamName = config.kinesisStreamNameOut;
    var kinesisRecord = {
      'Data': entry,
      'PartitionKey': partitionKey,
      'StreamName': streamName
    }
    return kinesisRecord;
  }

  // map to records objects as needed
  function parseData(payload) {
    var record = type.fromBuffer(payload);
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
