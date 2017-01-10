module.exports = function exports(config) {
  return config.set({
    basePath: '../',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      // load polyfils
      { pattern: 'node_modules/es6-promise/dist/es6-promise.min.js', watched: false },

      // load dependencies
      { pattern: 'node_modules/jquery/dist/jquery.js', watched: false },
      { pattern: 'node_modules/underscore/underscore-min.js', watched: false },
      { pattern: 'node_modules/backbone/backbone-min.js', watched: false },
      { pattern: 'node_modules/localforage/dist/localforage.js', watched: false },

      { pattern: 'tests.webpack.js', watched: false },
      { pattern: 'test/images/*.jpg', watched: false, included: false, served: true, nocache: false },
    ],

    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },

    webpack: require('../webpack.config.js'),

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
      require('karma-safari-launcher'),
      require('karma-firefox-launcher'),
    ],
  });
};
