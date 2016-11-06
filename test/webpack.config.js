const path = require('path');
const webpackCommon = require('../webpack.common');

const webpackConfig = Object.assign({}, webpackCommon, {
  entry: [
    path.resolve('test', 'app.ts'),
  ],
  output: {
    path: path.resolve('..', 'build', 'test'),
    filename: 'app.js',
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' },
    ],
  },
});

webpackConfig.plugins[0].definitions.TEST = true;

module.exports = webpackConfig;
