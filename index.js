console.log('Loading Discovery Queue Manager');

var aws = require('aws-sdk');
var _ = require('lodash');

// kinesis stream handler
exports.kinesisHandler = function(records, context) {
  console.log('Processing ' + records.length + ' records');

  // do stuff here

  context.done();
};

// main function
exports.handler = function(event, context) {
    var record = event.Records[0];
    if (record.kinesis) {
        exports.kinesisHandler(event.Records, context);
    }
};
