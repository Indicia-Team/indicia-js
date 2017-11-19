require('dotenv').config();
var merge = require('webpack-merge');
var _ = require('underscore');
var karmaConfig = require('./_karma.conf.js');
var commonConfig = karmaConfig({ set(c) { return c; } });

// Browsers to run on Sauce Labs platforms
var sauceBrowsers = _.reduce([
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

  ['MicrosoftEdge', '14.14393', 'Windows 10'],
  ['internet explorer', '11', 'Windows 10'],
  ['internet explorer', '10', 'Windows 8'],

  ['android', '5.1'],
  ['android', '5'],
  ['android', '4.4'],
  // ['android', '4.3'],
  // ['android', '4.1'],

  // ['safari', '9'],
  // ['safari', '8.0', 'OS X 10.10'],

], function (memo, platform) {
  // internet explorer -> ie
  var label = platform[0].split(' ');
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

var BUILD = 'LOCAL #' + new Date().getTime();
if (process.env.TRAVIS_BUILD_NUMBER ) {
  BUILD = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
}

module.exports =  function(config) {
  delete commonConfig.browsers; // remove Chrome and Safari

  config.set(merge(commonConfig, {
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
  }));
};

