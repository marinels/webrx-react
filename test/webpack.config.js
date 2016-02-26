var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './test/app.ts'
  ],
  output: {
    path: path.join(__dirname, '..', 'build', 'test'),
    filename: 'app.js'
  },
  externals: {
    jquery: 'var null'
  },
  devtool: 'sourcemap',
  plugins: [
    new webpack.DefinePlugin({ DEBUG: false, PRODUCTION: false, TEST: true, WEBPACK_DEV_SERVER: false })
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
    alias: {
      webrx: 'webrx/dist/web.rx.lite.js',
      Ix: 'ix/l2o' // the ix package uses Ix to refer to l2o for some reason
    }
  },
  failOnError: true
};
