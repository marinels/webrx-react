var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: [
      path.join(__dirname, 'src/index.tsx')
    ],
    vendor: [
      'rx',
      'ix',
      'moment',
      'webrx',
      'jquery-param',
      'jquery-deparam',
      'bootstrap/less/bootstrap.less',
      'react',
      'react-dom',
      'react-bootstrap',
      'react-fa',
      'react-addons-css-transition-group',
      'react-bootstrap-datetimepicker'
    ]
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js'
  },
  externals: {
    jquery: 'var null'
  },
  plugins: [
    new webpack.DefinePlugin({ DEBUG: false, PRODUCTION: false, TEST: false, WEBPACK_SERVER: false }),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new ExtractTextPlugin('[name].css')
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') },
      { test: /moment[\/\\]locale/, loader: 'file?name=locale/moment/[name].[ext]'},
      { test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.tsx?$/, loader: 'ts' }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
    alias: {
      Ix: 'ix/l2o', // the ix package uses Ix to refer to l2o for some reason
    }
  },
  progress: true,
  failOnError: true
};
