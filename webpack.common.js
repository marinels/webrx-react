const webpack = require('webpack');

module.exports = {
  externals: {
    jquery: 'var null',
  },
  devtool: 'source-map',
  plugins: [
    // eslint-disable-next-line id-match
    new webpack.DefinePlugin({ DEBUG: false, PRODUCTION: false, TEST: false, WEBPACK_DEV_SERVER: false }),
  ],
  resolve: {
    extensions: [ '.ts', '.tsx', '.webpack.js', '.web.js', '.js' ],
    alias: {
      'moment$': 'moment/moment',
    },
  },
  // failOnError: true,
};
