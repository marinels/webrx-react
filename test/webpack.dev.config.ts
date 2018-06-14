import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';

defaultArgs = {
  'env.entryPath': path.resolve(__dirname, 'app.spec.ts'),
  'env.templatePath': path.resolve(__dirname, 'index.ejs'),
  'env.releasePath': 'watch',
};

import { args, commonConfig } from '../webpack.common';

const testConfig: Partial<webpack.Configuration> = {
  entry: {
    'app.spec': [
      args.env.entryPath,
    ],
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
  definePlugin.definitions.WEBPACK_DEV_SERVER = true;
}

config.plugins!.push(
  new webpack.HotModuleReplacementPlugin(),
);

export default config;
