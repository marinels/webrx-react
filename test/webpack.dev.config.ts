import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

defaultArgs = {
  'env.templatePath': path.resolve(__dirname, 'index.ejs'),
};

import { commonConfig, args } from '../webpack.common';

const testConfig: Partial<webpack.Configuration> = {
  entry: {
    spec: [
      path.resolve(__dirname, 'app.spec.ts'),
    ],
  },
  output: {
    path: path.resolve(args.env.buildPath, 'watch'),
    filename: '[name].js',
  },
  devtool: 'eval',
  devServer: {
    hot: true,
    host: '0.0.0.0',
    port: args.env.port,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.spec\.tsx?$/, loaders: [ 'mocha-loader', 'awesome-typescript-loader' ] },
    ],
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, testConfig);

const definePlugin: any = config.plugins![0];

if (definePlugin != null) {
  definePlugin.definitions.TEST = true;
}

config.plugins!.push(
  new webpack.HotModuleReplacementPlugin(),
);

export default config;
