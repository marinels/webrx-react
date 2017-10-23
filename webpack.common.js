const webpack = require('webpack');
const npmPackage = require('./package.json');

module.exports = {
  externals: {
    jquery: 'var null',
  },
  devtool: 'source-map',
  plugins: [
    // eslint-disable-next-line id-match
    new webpack.DefinePlugin({
      DEBUG: false,
      PRODUCTION: false,
      TEST: false,
      WEBPACK_DEV_SERVER: false,
      VERSION: JSON.stringify(npmPackage.version),
    }),
  ],
  resolve: {
    extensions: [ '.ts', '.tsx', '.webpack.js', '.web.js', '.js' ],
    alias: {
      'ix$': 'ix/Ix',
      'moment$': 'moment/moment',
      'rxjs$': 'rxjs/Rx',
    },
  },
  // failOnError: true,
};
