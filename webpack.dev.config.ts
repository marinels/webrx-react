import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

import { commonConfig, args } from './webpack.common';

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    app: [
      'react-hot-loader/patch',
      './src/app.tsx',
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
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

(config.module as webpack.NewModule).rules.splice(-1, 1,
  { test: /\.tsx?$/, loaders: [ 'react-hot-loader/webpack', 'awesome-typescript-loader' ] },
);

const definePlugin: any = config.plugins![0];

if (definePlugin != null) {
  definePlugin.definitions.DEBUG = true;
  definePlugin.definitions.WEBPACK_DEV_SERVER = true;
}

export default config;
