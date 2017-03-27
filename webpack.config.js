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
      'ix',
      'jquery-param',
      'jquery-deparam',
      'moment',
      'react',
      'react-addons-css-transition-group',
      'react-addons-transition-group',
      'react-bootstrap',
      'react-dom',
      'react-fa',
      'rx',
      'webrx',
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
      { test: /\.css$/, use: cssLoader },
      { test: /\.less$/, use: lessLoader },
      { test: /moment[\\/]locale/, use: 'file-loader?name=locale/moment/[name].[ext]' },
      { test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: 'file-loader?name=fonts/[name].[ext]' },
      { test: /\.tsx?$/, use: 'awesome-typescript-loader' },
    ],
  },
});
