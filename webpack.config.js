var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: ['./src/index.tsx'],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: false,
      PRODUCTION: false
    })
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      //{ test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file?name=[name].[ext]" },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url?mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url" },
      { test: /\.tsx?$/, loaders: ['react-hot', 'ts'], include: path.join(__dirname, 'src') }
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
