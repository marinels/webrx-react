import * as path from 'path';
import * as webpack from 'webpack';

import { commonConfig, args } from '../webpack.common';

const testConfig: Partial<webpack.Configuration> = {
  entry: [
    path.resolve(__dirname, 'app.spec.ts'),
  ],
  output: {
    path: path.resolve(args.env.buildPath, 'test'),
    filename: 'app.spec.js',
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
    ],
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, testConfig);

const definePlugin: any = config.plugins![0];

if (definePlugin != null) {
  definePlugin.definitions.TEST = true;
}

export default config;
