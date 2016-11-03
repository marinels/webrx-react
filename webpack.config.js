const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackCommon = require('./webpack.common');

module.exports = Object.assign({}, webpackCommon, {
  entry: {
    app: [
      path.resolve('src', 'app.tsx'),
    ],
    vendor: [
      'bootstrap/less/bootstrap.less',
      'classnames',
      'ix',
      'jquery-param',
      'jquery-deparam',
      'moment',
      'react',
      'react-addons-css-transition-group',
      'react-bootstrap',
      'react-bootstrap-datetimepicker',
      'react-dom',
      'react-fa',
      'rx',
      'webrx',
    ],
  },
  output: {
    path: path.resolve('build'),
    filename: 'app.js',
  },
  plugins: [
    webpackCommon.plugins[0],
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new ExtractTextPlugin('[name].css'),
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') },
      { test: /moment[\\\/]locale/, loader: 'file?name=locale/moment/[name].[ext]' },
      { test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.tsx?$/, loader: 'ts' },
    ],
  },
});
