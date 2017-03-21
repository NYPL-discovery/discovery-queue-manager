console.log('Loading Discovery Queue Manager');

const avro = require('avsc');
const aws = require('aws-sdk');
const _ = require('lodash');
const config = require('./config.js');
const Promise = require('promise');
const schema = require('./avro-schema.js');

// kinesis stream handler
exports.kinesisHandler = function(records, context, callback) {
  console.log('Processing ' + records.length + ' records');

  // initialize avro schema
  const avroType = avro.parse(schema);

  // process kinesis records
  var data = records
    .map(function(record) {
      return new Buffer(record.kinesis.data, 'base64');
    })
    .map(parseData);

  // aggregate data
  var aggData = _.chain(data)
    .groupBy(process.env['GROUP_BY_FIELD'])
    .toPairs()
    .filter(function(pair){ return pair[1] && pair[1].length; })
    .map(aggregateData)
    .value();

  // to avro/kinesis data
  var kinesisData = aggData
    .map(avroify)
    .map(kinesisify)

  // post data to stream
  postData(kinesisData).then(function(res){
    callback(null, aggData);
  },function(err){
    callback(err);
  });

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
    return avroType.toBuffer(entry);
  }

  // map to records objects as needed
  function kinesisify(entry) {
    var partitionKey = 'pk-' + guid();
    var kinesisRecord = {
      'Data': entry,
      'PartitionKey': partitionKey
    }
    return kinesisRecord;
  }

  // map to records objects as needed
  function parseData(payload) {
    var record = avroType.fromBuffer(payload);
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

    var params = {
      Records: records,
      StreamName: process.env['KINESIS_STREAM_NAME_OUT']
    };

    return new Promise(function (resolve, reject) {
      kinesis.putRecords(params, function(err, data) {
        if (err) {
          console.log(err);
          reject(err);

        } else {
          resolve(data);
        }
      });
    });
  }
};

// main function
exports.handler = function(event, context, callback) {
  var record = event.Records[0];
  if (record.kinesis) {
    exports.kinesisHandler(event.Records, context, callback);
  }
};
