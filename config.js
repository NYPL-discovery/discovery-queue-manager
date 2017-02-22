var config = {};

config.aws = {
  kinesis: {
    ShardCount: 1,
    StreamName: 'DocumentQueue'
  }
};

module.exports = config;
