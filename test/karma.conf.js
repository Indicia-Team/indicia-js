var path = require('path');

module.exports = function exports(config) {
  config.set({
    basePath: '../',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    frameworks: ['mocha', 'chai'],

    files: [
      { pattern: 'test/vendor/indexeddbshim.min.js', watched: false },
      { pattern: 'tests.webpack.js', watched: false },
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

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-phantomjs-launcher'),
      require('karma-chrome-launcher'),
    ],
    logLevel: config.LOG_INFO,
  });
};
