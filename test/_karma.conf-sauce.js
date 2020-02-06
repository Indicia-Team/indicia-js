/**
 * Config copied with mods from backbone karma sauce config
 */
require('dotenv').config({ silent: true }); // eslint-disable-line
const karmaConfig = require('./_karma.conf.js');

const commonConfig = karmaConfig({
  set(c) {
    return c;
  },
});

process.env.NODE_ENV = 'test';
process.env.SAUCE_LABS = true;

const sauceBrowsers = [
  ['Browser', '8', 'Android', 'Android Emulator'], // latest
  ['Browser', '6', 'Android', 'Android Emulator'], // bottom
  ['Safari', '13.0', 'iOS', 'iPhone SE'], // latest
  ['Safari', '10.3', 'iOS', 'iPhone SE'], // bottom
].reduce(
  (browsers, [browserName, version, platform, device]) => ({
    ...browsers,
    ...{
      [`sl_${browserName}_${version}`]: {
        base: 'SauceLabs',
        browserName,
        version,
        platform,
        device,
      },
    },
  }),
  {}
);

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
