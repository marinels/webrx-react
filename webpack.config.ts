import * as path from 'path';
import * as webpack from 'webpack';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

import { commonConfig, args } from './webpack.common';

const cssLoader = ExtractTextPlugin.extract(
  {
    fallback: 'style-loader',
    use: {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        minimize: args.env.min,
      },
    },
  },
);
const lessLoader = ExtractTextPlugin.extract(
  {
    fallback: 'style-loader',
    use: [
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          minimize: args.env.min,
        },
      },
      {
        loader: 'less-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
);

const outputTag = args.env.min ? '.min' : '';

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    'webrx-react': [
      args.env.entryPath,
    ],
  },
  output: {
    path: path.resolve(args.env.buildPath, args.env.release ? 'release' : 'debug'),
    filename: `[name]${ outputTag }.js`,
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

(config.module as webpack.NewModule).rules.splice(0, 2,
  { test: /\.css$/, use: cssLoader },
  { test: /\.less$/, use: lessLoader },
);

config.plugins!.push(
  new ExtractTextPlugin(`[name]${ outputTag }.css`),
);

export default config;
