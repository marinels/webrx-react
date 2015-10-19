var path = require('path');
var webpack = require('webpack');

var isProduction = process.argv.indexOf('-p') >= 0 ? true : false;
var isDebug = process.argv.indexOf('-d') >= 0 ? true : false;
var plugins = [];
var entry = [];
var output = 'build';

if (isProduction) {
  output = 'dist';

  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
} else if (isDebug) {
} else {
  entry.push('webpack-dev-server/client?http://localhost:3000');
  entry.push('webpack/hot/only-dev-server');

  plugins.push(new webpack.HotModuleReplacementPlugin());
}

entry.push('./src/index.tsx');
entry.push('./index.html')

module.exports = {
  entry: entry,
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
      { test: /index\.html$/, loader: 'file?name=[path][name].[ext]&context=' + __dirname }
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
