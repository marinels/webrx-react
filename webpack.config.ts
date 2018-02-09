import * as path from 'path';
import * as webpack from 'webpack';

defaultArgs = {
  'env.extractText': true,
};

import { commonConfig, args } from './webpack.common';

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    'webrx-react': [
      args.env.entryPath,
    ],
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

export default config;
