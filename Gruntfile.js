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

                    out: '<%= pkg.name %>.js',

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
                src: '<%= pkg.name %>.js',

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
                configFile: 'test/karma.conf.js'
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
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('default', ['build', 'karma']);

};
