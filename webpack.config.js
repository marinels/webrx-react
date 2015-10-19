var path = require('path');
var webpack = require('webpack');

var plugins = [];
var output = 'build';

var isProduction = process.argv.indexOf('-p') >= 0 ? true : false;

if (isProduction) {
  output = 'dist';

  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}

module.exports = {
  entry: [
    './src/index.tsx',
    './index.html'
  ],
  output: {
    path: path.join(__dirname, output),
    filename: 'app.js'
  },
  plugins: plugins,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.tsx?$/, loaders: ['react-hot', 'ts'], include: path.join(__dirname, 'src') },
      { test: /index\.html$/, loader: 'file?name=[name].[ext]' }
    ]
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js']
  },
  stats: {
    colors: true,
    modules: true,
    reasons: true
  },
  progress: true,
  failOnError: true
};
