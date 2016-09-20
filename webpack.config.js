const path = require('path');
const _ = require('underscore');
const webpack = require('webpack');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const pkg = require('./package.json');

var filename = 'morel.js';

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
];

if (uglify) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
  }));
  filename = 'morel.min.js';
}

module.exports = {
  context: './src',
  entry: {
    morel: './main.js',
  },
  output: {
    path: 'dist',
    filename,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    jquery: 'jQuery',
    backbone: 'Backbone',
    underscore: '_',
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
        // test: /^\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins,
};
