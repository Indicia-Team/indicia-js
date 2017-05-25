const path = require('path');
const _ = require('underscore');
const webpack = require('webpack');
const pkg = require('./package.json');

var filename = 'indicia.js';

const banner = `
${pkg.name} ${pkg.version}
${pkg.description}
${pkg.homepage}
Author ${pkg.author.name}
Released under the ${_.pluck(pkg.licenses, 'type').join(', ')} license.
${_.pluck(pkg.licenses, 'url')}
`;

// production uglify
const uglify = process.argv.indexOf('--uglify') !== -1;
const plugins = [
  new webpack.DefinePlugin({
    LIB_VERSION: JSON.stringify(pkg.version),
  }),
  new webpack.BannerPlugin(banner),
  new webpack.ProvidePlugin({
    _: 'underscore',
    Backbone: 'backbone',
    $: 'jquery',
    LocalForage: 'localforage',
  }),

];

if (uglify) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
  }));
  filename = 'indicia.min.js';
}

module.exports = {
  context: './src',
  entry: {
    indicia: './main.ts',
  },
  output: {
    path: 'dist',
    filename,
    library: 'Indicia',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: '$',
      root: '$',
    },
    backbone: {
      commonjs: 'backbone',
      commonjs2: 'backbone',
      amd: 'Backbone',
      root: 'Backbone',
    },
    underscore: {
      commonjs: 'underscore',
      commonjs2: 'underscore',
      amd: '_',
      root: '_',
    },
    localforage: {
      commonjs: 'localforage',
      commonjs2: 'localforage',
      amd: 'localforage',
      root: 'localforage',
    },
  },
  resolve: {
    root: [
      path.resolve('./src'),
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      { test: /\.json/, loader: 'json' },
    ],
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [ 'babel-loader', 'ts-loader' ],
      }
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    }
  },
  plugins,
};
