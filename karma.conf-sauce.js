/**
 * Config copied with mods from backbone karma sauce config
 */

module.exports = function(config) {
  if ( !process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY ) {
    console.log('Sauce environments not set --- Skipping');
    return process.exit(0);
  }



  // Browsers to run on Sauce Labs
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'windows 8'
    },
    'SL_InternetExplorer': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '10'
    },
    'SL_InternetExplorer9': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '9'
    },
    'SL_FireFox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'linux'
    }
  };

  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'test/vendor/indexeddbshim.min.js',
      'dist/morel.js',
      'test/*.js'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],


    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,


    sauceLabs: {
      testName: 'Karma and Sauce Labs demo'
    },

    captureTimeout: 120000,

    customLaunchers: customLaunchers

  });
};