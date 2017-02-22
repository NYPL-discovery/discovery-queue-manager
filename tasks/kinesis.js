'use strict';

var aws = require('aws-sdk');
var async = require('async');
var config = require('../config.js');

module.exports = function (grunt) {

  var DESC = 'Creates or describes a kinesis stream';
  var DEFAULTS = {
    endpoint: "kinesis.us-east-1.amazonaws.com",
    region: "us-east-1",
    params: config.aws.kinesis
  };

  grunt.registerMultiTask('kinesis', DESC, function () {
    var done = this.async();
    var defaultParams = DEFAULTS.params;

    var credentials = new aws.SharedIniFileCredentials({profile: 'default'});
    aws.config.credentials = credentials;
    aws.config.apiVersions = {
      kinesis: '2013-12-02',
    };

    var kinesis = new aws.Kinesis();
    kinesis.config.region = DEFAULTS.region;
    kinesis.config.endpoint = DEFAULTS.endpoint;
    kinesis.region = DEFAULTS.region;
    kinesis.endpoint = DEFAULTS.endpoint;

    var subtasks = [];
    subtasks.push(createOrDescribeStream);
    async.series(subtasks, done);

    function createStream(callback) {
      var params = {
        ShardCount: defaultParams.ShardCount,
        StreamName: defaultParams.StreamName
      }
      console.log('Attempting to create stream ' + defaultParams.StreamName)
      kinesis.createStream(params, function(err, data) {
        if (err) console.log(err);
        else {
          console.log('Successfully created stream ' + params.StreamName);
          console.log(data);
        }
        callback(err);
      });
    }

    function createOrDescribeStream(callback) {
      var params = {
        StreamName: defaultParams.StreamName
      };
      kinesis.describeStream(params, function(err, data) {
        if (err) {
          if (err.code === 'ResourceNotFoundException') {
            console.log('Could not find stream ' + params.StreamName);
            createStream(callback);

          } else {
            console.log(err);
            callback(err);
          }

        } else {
          console.log('Found ' + params.StreamName + ' stream with ARN: ' + data.StreamDescription.StreamARN);
          DEFAULTS.streamARN = data.StreamDescription.StreamARN;
          callback(err);
        }
      });
    }

    function taskComplete(err) {
      if(err) {
        grunt.fail.warn(err);
        return done(false);
      }
    }
  });
}
