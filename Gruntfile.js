const webpackConfig = require('./webpack.config.js');

module.exports = function (grunt) {
  'use strict';
  var banner = "/*!\n" +
    " * <%= pkg.name %> <%= pkg.version %>\n" +
    " * <%= pkg.description %> \n" +
    " *\n" +
    " * <%= pkg.homepage %>\n" +
    " *\n" +
    " * Author <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
    " * Released under the <%= _.pluck(pkg.licenses, 'type').join(', ') %> license.\n" +
    " * <%= _.pluck(pkg.licenses, 'url') %>\n" +
    " */\n";

  var DIST_LOC = 'dist/';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    replace: {
      version: {
        src: [
          DIST_LOC + '<%= pkg.name %>.js'
        ],
        overwrite: true,     // overwrite matched source files
        replacements: [{
          from: /(m\.VERSION =) \'0\';/g,     // string replacement
          to: '$1 \'<%= pkg.version %>\';'
        }]
      }
    },

    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: banner
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.src.dest %>']
        }
      }
    },

    karma: {
      local: {
        configFile: 'test/karma.conf.js',
      },
      sauce: {
        configFile: 'test/karma.conf-sauce.js',
      },
    },

    webpack: {
      // Main run
      main: webpackConfig,

      build: {
        // configuration for this build
      },
    },
  });

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-text-replace');

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('build', ['requirejs', 'concat', 'replace', 'uglify']);
  grunt.registerTask('test', ['karma:local']);
  grunt.registerTask('default', ['build']);

};
