module.exports = function (config) {
    'use strict';
    config.set({


        basePath: '',

        frameworks: ['mocha', 'chai'],

        files: [
            '*.js',
            '../libs/jquery-1.11.1/jquery-1.11.1.js',
            '../src/*.js'
        ],

        reporters: ['progress'],

        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: false,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO

    });
};