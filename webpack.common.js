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
      // use es5 target for ix modules
      'ix': 'ix/targets/es5/cjs',
      // this ensures we pull in the es5 ix api surface instead of the defautl dist bundle
      'ix$': 'ix/Ix',
    },
  },
  // failOnError: true,
};
