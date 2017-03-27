const path = require('path');
const clone = require('clone');
const webpackCommon = require('../webpack.common');

const webpackConfig = Object.assign(clone(webpackCommon), {
  entry: [
    path.resolve(__dirname, 'app.spec.ts'),
  ],
  output: {
    path: path.resolve(__dirname, '..', 'build', 'test'),
    filename: 'app.spec.js',
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
    ],
  },
});

webpackConfig.plugins[0].definitions.TEST = true;

module.exports = webpackConfig;
