var path = require('path');
var webpack = require('webpack');

var defines = {
  DEBUG: false,
  PRODUCTION: false
};
var plugins = [];
var output = 'build';
var fileName = 'app.js';
var entry = [
  // 'es5-shim',
  // 'es5-shim/es5-sham',
  './src/index.tsx',
  './index.html'
];
var aliases = {
  Ix: 'ix/l2o', // the ix package uses Ix to refer to l2o for some reason
  // rx: 'rx/dist/rx.all.compat'
};

var isProduction = process.argv.indexOf('-p') >= 0 ? true : false;

if (isProduction) {
  defines.PRODUCTION = true;
  fileName = 'app.min.js';

  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      comments: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-ca|en-gb/)
  );
} else {
  defines.DEBUG = true;
}

plugins.push(
  new webpack.DefinePlugin(defines)
)

module.exports = {
  entry: entry,
  output: {
    path: path.join(__dirname, output),
    filename: fileName
  },
  devtool: '#source-map',
  plugins: plugins,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      //{ test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file?name=[name].[ext]" },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url?mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url" },
      { test: /\.tsx?$/, loaders: ['react-hot', 'ts'], include: path.join(__dirname, 'src') },
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
