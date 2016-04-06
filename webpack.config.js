const path = require('path');

module.exports = {
  context: './src',
  entry: {
    app: './main.js',
  },
  output: {
    path: 'dist',
    filename: 'morel.js',
    library: 'Morel',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    jquery: 'jquery',
    backbone: 'backbone',
    underscore: 'underscore',
  },
  resolve: {
    root: [
      path.resolve('./src'),
    ],
    alias: {

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
};
