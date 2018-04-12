import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

defaultArgs = {
  'env.releasePath': 'watch',
};

import { commonConfig, args } from './webpack.common';

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    app: [
      'core-js',
      'react-hot-loader/patch',
      args.env.entryPath,
    ],
  },
  devtool: 'eval',
  devServer: {
    hot: true,
    host: '0.0.0.0',
    port: args.env.port,
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

(config.module as webpack.Module).rules.splice(-1, 1,
  { test: /\.tsx?$/, loaders: [ 'react-hot-loader/webpack', 'awesome-typescript-loader' ] },
);

const definePlugin: any = config.plugins![0];

if (definePlugin != null) {
  definePlugin.definitions.DEBUG = true;
  definePlugin.definitions.WEBPACK_DEV_SERVER = true;
}

config.plugins!.push(
  new webpack.HotModuleReplacementPlugin(),
);

export default config;
