/// <reference path="./tooling.d.ts" />

import * as path from 'path';
import * as webpack from 'webpack';
import * as minimist from 'minimist';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as FaviconsWebpackPlugin from 'favicons-webpack-plugin';

// tslint:disable-next-line:no-var-requires
const npmPackage = require('./package.json');

const options = {
  string: [
    'env.buildPath',
    'env.entryPath',
    'env.templatePath',
  ],
  number: [
    'env.port',
  ],
  boolean: [
    'env.release',
    'env.min',
    'env.profile',
  ],
  default: {
    'env.buildPath': path.resolve(__dirname, 'build'),
    'env.entryPath': path.resolve(__dirname, 'src', 'webrx-react.ts'),
    'env.port': 3000,
    'env.release': false,
    'env.min': false,
    'env.profile': false,
  },
};

export const args = minimist(process.argv, options);

export const commonConfig: Partial<webpack.Configuration> = {
  devtool: 'source-map',
  externals: {
    jquery: 'var null',
  },
  module: {
    rules: [
      { test: /\.css$/, loaders: [ 'style-loader', 'css-loader' ] },
      { test: /\.less$/, loaders: [ 'style-loader', 'css-loader', 'less-loader' ] },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader' },
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader' },
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: !args.env.release,
      PRODUCTION: args.env.release,
      TEST: false,
      WEBPACK_DEV_SERVER: false,
      VERSION: JSON.stringify(npmPackage.version),
    }),
    new webpack.NamedModulesPlugin(),
    // new FaviconsWebpackPlugin('./src/assets/logo.png'),
  ],
  resolve: {
    extensions: [ '.ts', '.tsx', '.webpack.js', '.web.js', '.js' ],
    alias: {
      'ix$': 'ix/Ix',
      'moment$': 'moment/moment',
      'rxjs$': 'rxjs/Rx',
    },
  },
};

if (args.env.release) {
  const defines: any = commonConfig.plugins![0];

  defines.definitions['process.env'] = {
    'NODE_ENV': JSON.stringify('production'),
  };
}

if (args.env.min) {
  commonConfig.plugins!.push(
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        warnings: false,
      },
      sourceMap: true,
    }),
  );
}

if (args.env.templatePath) {
  commonConfig.plugins!.push(
    new HtmlWebpackPlugin({
      title: 'webrx-react',
      chunksSortMode: 'dependency',
      template: args.env.templatePath,
    }),
  );
}

if (args.env.profile) {
  // tslint:disable-next-line no-var-requires
  const { StatsWriterPlugin } = require('webpack-stats-plugin');

  commonConfig.plugins!.push(
    new StatsWriterPlugin({
      fields: null,
      stats: { chunkModules: true },
    }),
  );
}
