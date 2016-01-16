var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: ['mocha!./test/index.ts'],
  output: {
    path: path.join(__dirname, '..', 'build', 'test'),
    filename: 'spec.js'
  },
  devtool: 'eval',
  plugins: [
    new webpack.DefinePlugin({ DEBUG: true, PRODUCTION: false, TEST: true, MOCK_API: true }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-ca/),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
    alias: {
      Ix: 'ix/l2o', // the ix package uses Ix to refer to l2o for some reason
    }
  }
};
