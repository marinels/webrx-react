import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

// tslint:disable-next-line:no-var-requires
const npmPackage = require('./package.json');
// tslint:disable-next-line:no-var-requires
const webpackCommon = require('./webpack.common');

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    app: [
      'react-hot-loader/patch',
      './src/app.tsx',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  devtool: 'eval',
  module: {
    rules: [
      { test: /\.css$/, loaders: [ 'style-loader', 'css-loader' ] },
      { test: /\.less$/, loaders: [ 'style-loader', 'css-loader', 'less-loader' ] },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader' },
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader' },
      { test: /\.tsx?$/, loaders: [ 'react-hot-loader/webpack', 'awesome-typescript-loader' ] },
    ],
  },
  devServer: {
    hot: true,
  },
};

const config: webpack.Configuration = Object.assign({}, webpackCommon, devConfig);

if (config.plugins == null) {
  config.plugins = [];
}

const definePlugin: any = config.plugins[0];

if (definePlugin != null) {
  definePlugin.definitions.DEBUG = true;
  definePlugin.definitions.WEBPACK_DEV_SERVER = true;
}

config.plugins.push(
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    title: 'react-hot-ts',
    chunksSortMode: 'dependency',
    template: path.resolve(__dirname, './src/index.ejs'),
  }),
);

export default config;
