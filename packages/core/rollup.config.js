/* eslint-disable import/no-extraneous-dependencies */
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const license = require('rollup-plugin-license');
const replace = require('rollup-plugin-replace');
const filesize = require('rollup-plugin-filesize');
const resolve = require('rollup-plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');

const pkg = require('./package.json');

const minify = process.env.minify || false;
const isProduction = process.env.NODE_ENV === 'production';

const banner = [
  `${pkg.name} ${pkg.version}`,
  `${pkg.description}`,
  `${pkg.homepage}`,
  `Author ${pkg.author.name}`,
  `Released under the ${pkg.licenses[0].type} license.`,
  `${pkg.licenses[0].url}`,
].join('\n');

const rollupBuilds = [
  {
    input: './src/index.js',
    output: {
      file: minify ? 'dist/indicia.min.js' : 'dist/indicia.js',
      format: 'umd',
      name: 'Indicia',
      sourcemap: true,
      globals: {
        underscore: '_',
        backbone: 'Backbone',
        jquery: '$',
        localforage: 'localforage',
      },
    },
    external: ['backbone', 'jquery', 'localforage', 'underscore'],
    plugins: [
      isProduction &&
        license({ banner: { commentStyle: 'ignored', content: banner } }),
      resolve(),
      replace({
        LIB_VERSION: JSON.stringify(pkg.version),
      }),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                android: '5.1',
                ios: '10.2',
              },
            },
          ],
        ],
        runtimeHelpers: true,
        plugins: [
          '@babel/plugin-transform-runtime',
          ['@babel/plugin-proposal-class-properties', { loose: false }],
        ],
        env: {
          test: {
            plugins: ['rewire'],
          },
        },
      }),
      commonjs(),
      isProduction && minify ? terser() : {},
      isProduction && filesize(),
    ],
  },
];

module.exports = rollupBuilds;
