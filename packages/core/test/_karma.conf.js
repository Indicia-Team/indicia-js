const rollupConfig = require('../rollup.config');

const config = {
  basePath: '../',

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['ChromiumHeadless'],
  // browsers: ['Chromium'],

  customLaunchers: {
    ChromeCustom: {
      base: 'ChromiumHeadless',
    },
  },
  frameworks: ['mocha', 'chai', 'sinon'],

  files: [
    {
      pattern: 'test/images/*.jpg',
      watched: false,
      included: false,
      served: true,
      nocache: false,
    },

    { pattern: 'src/*.js', watched: true, },
    { pattern: 'test/*test.js', watched: false },
  ],

  preprocessors: {
    'src/*.js': ['rollup'],
    'test/*test.js': ['rollup'],
  },

  rollupPreprocessor: {
    ...rollupConfig[0],
    output: {
      ...rollupConfig[0].output,
      format: 'iife', // Helps prevent naming collisions.
      sourcemap: 'inline', // Sensible for testing.
      file: null,
    },
  },

  browserDisconnectTimeout: 10000,
  browserDisconnectTolerance: 3,
  browserNoActivityTimeout: 60000,

  // enable / disable watching file and executing tests whenever any file changes
  // autoWatch: true,

  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['mocha'],

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: true,
};

module.exports = function exports(_config) {
  return _config.set(config);
};
