const path = require('path');
const clone = require('clone');
const webpackCommon = require('../webpack.common');

const webpackConfig = Object.assign(clone(webpackCommon), {
  entry: [
    path.resolve('test', 'app.spec.ts'),
  ],
  output: {
    path: path.resolve('..', 'build', 'test'),
    filename: 'app.spec.js',
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'awesome-typescript' },
    ],
  },
});

webpackConfig.plugins[0].definitions.TEST = true;

module.exports = webpackConfig;
