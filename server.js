var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var host = '0.0.0.0';
var port = 3000;

config.entry.unshift('webpack-dev-server/client?http://localhost:3000', 'webpack/hot/only-dev-server');
config.plugins.push(new webpack.HotModuleReplacementPlugin());

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(port, host, function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at ' + host + ':' + port);
});
