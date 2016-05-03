const path = require('path');
const webpackCommon = require('../webpack.common');

const webpackConfig = Object.assign({}, webpackCommon, {
  entry: [
    './test/app.ts',
  ],
  output: {
    path: path.join(__dirname, '..', 'build', 'test'),
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
