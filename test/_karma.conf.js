const rollupConfig = require('../rollup.config');

const config = {
  basePath: '../',

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['ChromeCustom'],

  customLaunchers: {
    ChromeCustom: {
      base: 'ChromiumHeadless',
    },
  },
  frameworks: ['mocha', 'chai', 'sinon'],

  files: [
    // load dependencies
    { pattern: 'node_modules/jquery/dist/jquery.js', watched: false },
    { pattern: 'node_modules/underscore/underscore.js', watched: false },
    { pattern: 'node_modules/backbone/backbone.js', watched: false },
    {
      pattern: 'node_modules/localforage/dist/localforage.js',
      watched: false,
    },

    {
      pattern: 'test/images/*.jpg',
      watched: false,
      included: false,
      served: true,
      nocache: false,
    },

    { pattern: 'src/*.js', included: false },
    { pattern: 'test/*test.js', type: 'module' },
  ],

  preprocessors: {
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
  autoWatch: true,

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
