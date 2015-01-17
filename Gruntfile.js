module.exports = function(grunt) {

    var  banner = "/*!\n" +
        " * Indicia Iform Mobile module's core library \n" +
        " * Version: <%= pkg.version %>\n" +
        " *\n" +
        " * <%= pkg.homepage %>\n" +
        " *\n" +
        " * Author <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
        " * Released under the <%= _.pluck(pkg.licenses, 'type').join(', ') %> license.\n" +
        " */\n";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: {
          install:{
              options:{
                  targetDir: './src/lib',
                  cleanBowerDir: true
              }
          }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
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

                // the files to concatenate
                src: [
                    'src/*.js'
                ],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.js'
            },

            src_lib: {
                // the files to concatenate
                src: [
                    'src/lib/IndexedDBShim/IndexedDBShim.js',
                    'src/lib/latlon/vector3d.js',
                    'src/lib/latlon/geo.js',
                    'src/lib/latlon/latlon-ellipsoid.js',
                    'src/lib/latlon/osgridref.js',
                    'src/lib/handlebars/handlebars.js',
                    'src/lib/photoswipe/lib/klass.min.js',
                    'src/lib/photoswipe/code.photoswipe.jquery-3.0.5.min.js'

                ],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.libs.js'
            }
        },
        replace: {
            version: {
                src: [
                    'dist/<%= pkg.name %>.js'
                ],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                        from: /(m\.version =) \'0\';/g,                   // string replacement
                        to: '$1 \'<%= pkg.version %>\';'
                    }
                ]
            },
            use_strict: {
                src: [
                    'dist/<%= pkg.name %>.libs.js'
                ],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                        from: /[\'"]use strict[\'"];/g,                   // string replacement
                        to: ''
                    }
                ]
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
        }

    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('init', ['bower']);
    grunt.registerTask('build', ['concat', 'replace', 'uglify']);
    grunt.registerTask('default', ['init', 'build']);

};
