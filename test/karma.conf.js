module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['mocha', 'chai'],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-phantomjs-launcher'
    ],

    files: [
      '../morel.js',
      '*.js'
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true
  });
};





