module.exports = function (grunt) {
  'use strict';
  var banner = "/*!\n" +
    " * Mobile Recording Library for biological data collection. \n" +
    " * Version: <%= pkg.version %>\n" +
    " *\n" +
    " * <%= pkg.homepage %>\n" +
    " *\n" +
    " * Author <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
    " * Released under the <%= _.pluck(pkg.licenses, 'type').join(', ') %>" +
    " * license.\n" +
    " */\n";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: '\n\n'
      },
      src: {
        options: {
          banner: banner
        },
        // the files to concatenate
        src: [
          'src/main.js',
          'src/io.js',
          'src/db.js',
          'src/auth.js',
          'src/record.js',
          'src/record.db.js',
          'src/record.inputs.js',
          'src/geoloc.js',
          'src/storage.js',
          'src/navigation.js',
          'src/image.js',
          'src/helper.js',
          'src/appcache_back_button_fix.js'
        ],
        // the location of the resulting JS file
        dest: '<%= pkg.name %>.js'
      }
    },
    replace: {
      version: {
        src: [
          '<%= pkg.name %>.js'
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
          '<%= pkg.name %>.min.js': ['<%= concat.src.dest %>']
        }
      }
    },
    karma: {
      unit: {
        browsers: ['Chrome'],
        frameworks: ['mocha', 'chai'],
        'plugins': [
          'karma-mocha',
          'karma-chai'
        ],
        files: [
          {src: ['test/*.js']},
          {src: ['src/*.js']}
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: false,
        // level of logging
        logLevel: 'ERROR'
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('build', ['concat', 'replace', 'uglify']);
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('default', ['build', 'karma']);

};
