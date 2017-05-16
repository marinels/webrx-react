const path = require('path');
const clone = require('clone');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackCommon = require('./webpack.common');

const cssLoader = ExtractTextPlugin.extract(
  { fallback: 'style-loader', use: 'css-loader?sourceMap' }
);
const lessLoader = ExtractTextPlugin.extract(
  { fallback: 'style-loader', use: [ 'css-loader?sourceMap', 'less-loader?sourceMap' ] }
);

module.exports = Object.assign(clone(webpackCommon), {
  entry: {
    'webrx-react': [
      path.resolve(__dirname, 'src', 'app.tsx'),
    ],
    vendor: [
      'bootstrap/less/bootstrap.less',
      'classnames',
      'clone',
      'ix',
      'jquery-deparam',
      'jquery-param',
      'moment',
      'react',
      'react-transition-group',
      'react-bootstrap',
      'react-dom',
      'react-fa',
      'rx',
      'rx-dom',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  plugins: [
    webpackCommon.plugins[0],
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.js' }),
    new ExtractTextPlugin('[name].css'),
  ],
  module: {
    rules: [
      { test: /\.css$/, loader: cssLoader },
      { test: /\.less$/, loader: lessLoader },
      { test: /moment[\\/]locale/, loader: 'file-loader?name=locale/moment/[name].[ext]' },
      { test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[name].[ext]' },
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
    ],
  },
});
