var path = require('path');
var webpack = require('webpack');

var plugins = [];
var output = 'build';
var fileName = 'test.js';
var entry = [
  // 'es5-shim',
  // 'es5-shim/es5-sham',
  './test/index.ts',
  './test/index.html'
];
var aliases = {
  Ix: 'ix/l2o', // the ix package uses Ix to refer to l2o for some reason
  // rx: 'rx/dist/rx.all.compat'
};

module.exports = {
  entry: entry,
  output: {
    path: path.join(__dirname, '..', output, 'test'),
    filename: fileName
  },
  devtool: '#source-map',
  plugins: plugins,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.tsx?$/, loaders: ['react-hot', 'ts'], include: path.join(__dirname, '..', 'src') },
      { test: /\.ts$/, loader: 'ts', include: __dirname },
      { test: /index\.html$/, loader: 'file?name=[name].[ext]' }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
    alias: aliases
  },
  stats: {
    reasons: true,
    chunkModules: true,
    chunkOrigins: true,
    modules: true,
    cached: true,
    cachedAssets: true,
    source: true,
    errorDetails: true,
    publicPath: true
  },
  progress: true,
  failOnError: true
};
