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

    requirejs: {
      compile: {
        options: {
          baseUrl: "src",
          optimize: "none",
          findNestedDependencies: true,
          skipModuleInsertion: true,

          include: [
            "main",
            "Manager",
            "Geoloc"
          ],

          out: DIST_LOC + '<%= pkg.name %>.js',

          pragmasOnSave: {
            buildExclude: true
          },

          wrap: {
            startFile: "src/wrap.start",
            endFile: "src/wrap.end"
          }
        }
      }
    },

    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: '\n\n'
      },
      src: {
        options: {
          banner: banner
        },
        // the file to update
        src: DIST_LOC + '<%= pkg.name %>.js',

        // the location of the resulting JS file
        dest: DIST_LOC + '<%= pkg.name %>.js'
      }
    },

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
        configFile: 'karma.conf.js'
      },
      sauce: {
        configFile: 'karma.conf-sauce.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('build', ['requirejs', 'concat', 'replace', 'uglify']);
  grunt.registerTask('test', ['karma:local']);
  grunt.registerTask('default', ['build']);

};
