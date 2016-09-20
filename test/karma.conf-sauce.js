/**
 * Config copied with mods from backbone karma sauce config
 */
const _ = require('./vendor/underscore');
const fs = require('fs');
const path = require('path');

// Browsers to run on Sauce Labs platforms
const sauceBrowsers = _.reduce([
  ['firefox', '48'],
  ['firefox', '45'],
  ['firefox', '44'],
  ['firefox', '43'],
  ['firefox', '42'],
  ['firefox', '41'],

  ['chrome', '53'],
  ['chrome', '40'],
  ['chrome', '39'],
  ['chrome', '30'],

  ['microsoftedge', '20.10240', 'Windows 10'],
  ['internet explorer', '11', 'Windows 10'],
  ['internet explorer', '10', 'Windows 8'],

  ['android', '5.1'],
  ['android', '5'],
  ['android', '4.4'],
  // ['android', '4.3'],
  // ['android', '4.1'],

  ['safari', '9'],
  ['safari', '8.0', 'OS X 10.10'],

], function (memo, platform) {
  // internet explorer -> ie
  let label = platform[0].split(' ');
  if (label.length > 1) {
    label = _.invoke(label, 'charAt', 0);
  }
  label = (label.join('') + '_v' + platform[1]).replace(' ', '_').toUpperCase();
  memo[label] = _.pick({
    'base': 'SauceLabs',
    'browserName': platform[0],
    'version': platform[1],
    'platform': platform[2],
  }, Boolean);
  return memo;
}, {});

module.exports = function (config) {
  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME) {
    if (!fs.existsSync('./test/sauce.json')) {
      console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
      process.exit(1);
    } else {
      process.env.SAUCE_USERNAME = require('./sauce').username;
      process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
    }
  }

  config.set({
    basePath: '../',

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      { pattern: 'test/vendor/indexeddbshim.min.js', watched: false },
      { pattern: 'tests.webpack.js', watched: false },
      { pattern: 'test/images/*.jpg', watched: false, included: false, served: true, nocache: false },
    ],

    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },

    webpack: {
      resolve: {
        root: [
          path.resolve('./test/vendor'),
        ],
        alias: {
          backbone: 'backbone',
          underscore: 'underscore',
        },
      },
      module: {
        loaders: [
          {
            // test: /^\.js$/,
            exclude: /(node_modules|bower_components|vendor)/,
            loader: 'babel-loader',
          },
        ],
      },
    },

    webpackServer: {
      noInfo: true,
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Number of sauce tests to start in parallel
    concurrency: 9,

    // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    },

    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,

    // Browsers to launch, commented out to prevent karma from starting
    // too many concurrent browsers and timing sauce out.
    browsers: _.keys(sauceBrowsers),

    plugins: [
      require('karma-webpack'),
      require('karma-sinon'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-phantomjs-launcher'),
      require('karma-sauce-launcher'),
    ],
  });
};
