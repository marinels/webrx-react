import * as path from 'path';
import * as webpack from 'webpack';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

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
  output: {
    path: path.resolve(args.env.buildPath, args.env.releasePath),
    filename: `${ args.env.outputFilename }${ args.env.outputTag }.js`,
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

export default config;
