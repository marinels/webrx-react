/// <reference path="./tooling.d.ts" />

import * as path from 'path';
import * as webpack from 'webpack';
import * as minimist from 'minimist';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

// sanitize default args to an empty object
if (typeof defaultArgs === 'undefined') {
  defaultArgs = {};
}

// tslint:disable-next-line:no-var-requires
const npmPackage = require('./package.json');

const defaults = Object.assign(
  {},
  {
    'env.buildPath': path.resolve(__dirname, 'build'),
    'env.entryPath': path.resolve(__dirname, 'src', 'app.tsx'),
    'env.templatePath': path.resolve(__dirname, 'src', 'index.ejs'),
    'env.outputFilename': '[name]',
    'env.templateOutputPath': 'index.html',
    'env.port': 3000,
    'env.templateInject': true,
    'env.release': false,
    'env.extractText': false,
    'env.extractLocale': false,
    'env.extractFont': false,
    'env.extractImage': false,
    'env.min': false,
    'env.sourceMap': true,
    'env.profile': false,
  },
  defaultArgs,
);

const options = {
  string: [
    'env.buildPath',
    'env.entryPath',
    'env.templatePath',
    'env.outputFilename',
    'env.outputTag',
    'env.releasePath',
    'env.templateOutputPath',
  ],
  number: [
    'env.port',
  ],
  boolean: [
    'env.templateInject',
    'env.release',
    'env.extractText',
    'env.extractLocale',
    'env.extractFont',
    'env.extractImage',
    'env.min',
    'env.sourceMap',
    'env.profile',
  ],
  default: defaults,
};

export const args = minimist(process.argv, options);

if (args.env.releasePath == null) {
  args.env.releasePath = args.env.release ? 'release' : 'debug';
}

if (args.env.outputTag == null) {
  args.env.outputTag = args.env.min ? '.min' : '';
}

// tslint:disable-next-line:no-console
console.log(`webpack args: ${ JSON.stringify(args, null, 2) }`);

export const commonConfig: Partial<webpack.Configuration> = {
  output: {
    path: path.resolve(args.env.buildPath, args.env.releasePath),
    filename: `${ args.env.outputFilename }${ args.env.outputTag }.js`,
  },
  devtool: args.env.sourceMap ? 'source-map' : undefined,
  externals: {
    jquery: 'var null',
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: !args.env.release,
      PRODUCTION: args.env.release,
      TEST: false,
      WEBPACK_DEV_SERVER: false,
      VERSION: JSON.stringify(npmPackage.version),
    }),
    new FaviconsWebpackPlugin('./src/Assets/logo.png'),
  ],
  resolve: {
    extensions: [ '.ts', '.tsx', '.webpack.js', '.web.js', '.js' ],
    alias: {
      'ix$': 'ix/Ix',
      'moment$': 'moment/moment',
      'rxjs$': 'rxjs/Rx',
    },
  },
  mode: args.env.release ? 'production' : 'development',
  optimization: {
    minimize: args.env.min,
    removeAvailableModules: args.env.release,
    removeEmptyChunks: args.env.release,
    mergeDuplicateChunks: args.env.release,
    flagIncludedChunks: args.env.release,
    namedModules: !args.env.release,
    namedChunks: !args.env.release,
  },
};

const rules: webpack.Rule[] = [];

if (args.env.extractText) {
  const cssLoader = ExtractTextPlugin.extract(
    {
      fallback: 'style-loader',
      use: {
        loader: 'css-loader',
        options: {
          sourceMap: args.env.sourceMap,
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
            sourceMap: args.env.sourceMap,
            minimize: args.env.min,
          },
        },
        {
          loader: 'less-loader',
          options: {
            sourceMap: args.env.sourceMap,
          },
        },
      ],
    },
  );

  rules.push(
    { test: /\.css$/, use: cssLoader },
    { test: /\.less$/, use: lessLoader },
  );

  commonConfig.plugins.push(
    new ExtractTextPlugin(`${ args.env.outputFilename }${ args.env.outputTag }.css`),
  );
}
else {
  rules.push(
    { test: /\.css$/, loaders: [ 'style-loader', 'css-loader' ] },
    { test: /\.less$/, loaders: [ 'style-loader', 'css-loader', 'less-loader' ] },
  );
}

if (args.env.extractFont) {
  rules.push(
    { test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[name].[ext]' },
  );
}
else {
  rules.push(
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?mimetype=application/font-woff' },
    { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader' },
  );
}

if (args.env.extractImage) {
  rules.push(
    { test: /\.(png|jpg|gif)$/, loader: 'file-loader?name=img/[name].[ext]' },
  );
}
else {
  rules.push(
    { test: /\.(png|jpg|gif)$/, loader: 'url-loader' },
  );
}

if (args.env.extractLocale) {
  rules.push(
    { test: /moment[\\/]locale/, loader: 'file-loader?name=locale/moment/[name].[ext]' },
  );
}

rules.push(
  { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
);

commonConfig.module = {
  rules,
};

if (args.env.release) {
  const defines: any = commonConfig.plugins![0];

  defines.definitions['process.env'] = {
    'NODE_ENV': JSON.stringify('production'),
  };
}

if (args.env.templatePath) {
  commonConfig.plugins!.push(
    new HtmlWebpackPlugin({
      title: 'webrx-react',
      chunksSortMode: 'dependency',
      template: args.env.templatePath,
      filename: args.env.templateOutputPath,
      hash: true,
      inject: args.env.templateInject,
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
