/**
 * Config copied with mods from backbone karma sauce config
 */
require('dotenv').config({ silent: true }); // eslint-disable-line
const _ = require('underscore');
const karmaConfig = require('./_karma.conf.js');

const commonConfig = karmaConfig({
  set(c) {
    return c;
  },
});

process.env.NODE_ENV = 'test';
process.env.SAUCE_LABS = true;

const sauceBrowsers = [
  /**  Browser environment */
  ['chrome', 'latest', 'linux'], // latest
  ['chrome', '38', 'linux'], // bottom support

  /**  Mobile environment */
  ['android', '8'], // latest
  ['android', '6'],
  ['android', '5.1'], // bottom support
  ['Safari', '12.2', 'iOS', 'iPhone 6'], // latest
  ['Safari', '11.1', 'iOS', 'iPhone 6'],
  ['Safari', '10.3', 'iOS', 'iPhone 6'], // bottom support
].reduce((memo, platform) => {
  let label = platform[0].split(' ');
  if (label.length > 1) {
    label = _.invoke(label, 'charAt', 0);
  }
  label = `${label.join('')}_v${platform[1]}`.replace(' ', '_').toUpperCase();
  // eslint-disable-next-line
  memo[label] = _.pick(
    {
      base: 'SauceLabs',
      browserName: platform[0],
      version: platform[1],
      platform: platform[2],
      device: platform[3],
    },
    Boolean
  );
  return memo;
}, {});

module.exports = function exports(config) {
  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log(
      'SAUCE_USERNAME and SAUCE_ACCESS_KEY env variables are required.'
    );
    process.exit(1);
  }

  return config.set({
    ...commonConfig,
    ...{
      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun: true,

      // Number of sauce tests to start in parallel
      concurrency: 5,

      // test results reporter to use
      reporters: ['dots', 'saucelabs'],
      logLevel: config.LOG_WARN,
      sauceLabs: {
        build: `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`,
        startConnect: false,
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      },
      urlRoot: '/__karma__/',

      proxies: {
        '/': 'http://localhost:4445',
      },
      captureTimeout: 120000,
      customLaunchers: sauceBrowsers,

      // Browsers to launch, commented out to prevent karma from starting
      // too many concurrent browsers and timing sauce out.
      browsers: Object.keys(sauceBrowsers),
    },
  });
};
