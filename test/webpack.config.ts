import * as path from 'path';
import * as webpack from 'webpack';

defaultArgs = {
  'env.entryPath': path.resolve(__dirname, 'app.spec.ts'),
  'env.templatePath': path.resolve(__dirname, 'index.ejs'),
  'env.releasePath': 'test',
};

import { args, commonConfig } from '../webpack.common';

const testConfig: Partial<webpack.Configuration> = {
  entry: {
    'app.spec': [
      args.env.entryPath,
    ],
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
