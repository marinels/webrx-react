var path = require('path');
var webpack = require('webpack');

var plugins = [];
var output = 'build';

module.exports = {
  entry: [
    './test/index.ts',
    './test/index.html'
  ],
  output: {
    path: path.join(__dirname, '..', output, 'test'),
    filename: 'test.js'
  },
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
    extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js']
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
