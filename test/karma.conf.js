const webpack = require('webpack');
const path = require('path');
const pkg = require('../package.json');
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../webpack.config.js');

const testWebpackConfig = webpackMerge(webpackConfig, {

});

module.exports = function exports(config) {
  config.set({
    basePath: '../',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      { pattern: 'test/vendor/indexeddbshim.min.js', watched: false },
      { pattern: 'test/vendor/jquery.js', watched: false },
      { pattern: 'test/vendor/underscore.js', watched: false },
      { pattern: 'test/vendor/backbone.js', watched: false },
      { pattern: 'tests.webpack.js', watched: false },
      { pattern: 'test/images/*.jpg', watched: false, included: false, served: true, nocache: false },
    ],

    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },

    webpack: testWebpackConfig,

    webpackServer: {
      noInfo: true,
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    plugins: [
      require('karma-webpack'),
      require('karma-sinon'),
      require('karma-mocha'),
      require('karma-mocha-reporter'),
      require('karma-chai'),
      require('karma-phantomjs-launcher'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
    ],
  });
};
