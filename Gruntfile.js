var grunt = require('grunt');
var async = require('async');

grunt.initConfig({
  kinesis: {
    default: {
      function: 'kinesis'
    }
  },
});

grunt.loadTasks('tasks');
grunt.registerTask('init', ['kinesis']);
