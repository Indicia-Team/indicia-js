module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      local: {
        configFile: 'test/karma.conf.js',
      },
      sauce: {
        configFile: 'test/karma.conf-sauce.js',
      },
    },

    webpack: {
      main: require('./webpack.config.js'),
    },
  });

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-karma');

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('test', ['karma:local']);
  grunt.registerTask('default', ['webpack:main']);
};
