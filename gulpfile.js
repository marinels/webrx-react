'use strict';

var fs = require('fs');
var path = require('path');
var del = require('del');
var parseArgs = require('minimist');

var gulp = require('gulp');
var gutil = require('gulp-util');
var gopen = require('gulp-open');
var greplace = require('gulp-replace');
var grename = require('gulp-rename');
var gmocha = require('gulp-mocha');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackConfigTemplate = require('./webpack.config.js');
var webpackTestConfigTemplate = require('./test/webpack.config.js');

var args = parseArgs(process.argv);

var defaultDest = path.join(__dirname, 'build');
var config = {
  verbose: args.verbose || false,
  force: args.force || false,
  dirs: {
    src: args.src || path.join(__dirname, 'src'),
    dest: args.dest || defaultDest,
    dist: args.dist || path.join(args.dest || defaultDest, 'dist'),
    test: args.test || path.join(args.dest || defaultDest, 'test'),
    publicPath: args.publicPath,
  },
  files: {
    app: 'app.js',
    vendor: 'vendor.js'
  },
  host: args.host || '0.0.0.0',
  port: args.port || 3000,
  test: {
    src: args.testSrc || path.join(__dirname, 'test'),
    port: args.testPort || 3001,
    reporter: args.reporter || 'dot'
  }
};

var definesTemplate = function() {
  return {
    DEBUG: false,
    PRODUCTION: false,
    TEST: false,
    MOCK_API: false
  };
}

var uri = 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.port;
var testUri = 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.test.port;

function runWebpack(cfg, tag, callback) {
  tag = '[webpack:' + tag + ']';
  var compiler = webpack(cfg);

  gutil.log(tag, 'Bundling...');
  compiler.run(function(err, stats) {
    if (err) {
      throw new gutil.PluginError(tag, err);
    }

    if (args.verbose === true) {
      gutil.log('[webpack:' + tag + ']', stats.toString({
  			colors: true
  		}));
    }

    var outputPath = stats.compilation.outputOptions.path;
    var assets = stats.toJson().assetsByChunkName;

    gutil.log(tag, 'Bundling Complete');
    for (var chunk in assets) {
      var asset = assets[chunk];

      if (Array.isArray(asset)) {
        for (var i in assets[chunk]) {
          gutil.log(gutil.colors.magenta(path.join(outputPath, asset[i])))
        }
      } else {
        gutil.log(gutil.colors.magenta(path.join(outputPath, asset)))
      }
    }

    if (callback) {
      callback(stats);
    }
  })
}

function getOutputPath(isProduction, enableStats, isTest) {
  if (isTest === true) {
    return path.join(config.dirs.dest, 'test');
  } else if (enableStats === true) {
    return path.join(config.dirs.dest, 'stats');
  } else if (isProduction === true) {
    return path.join(config.dirs.dest, 'prod');
  } else {
    return path.join(config.dirs.dest, 'debug');
  }
}

function configureWebpack(isProduction, enableStats, enableServer) {
  var webpackConfig = Object.create(webpackConfigTemplate);
  var defines = definesTemplate();

  webpackConfig.output.publicPath = config.dirs.publicPath;

  if (enableServer === true) {
    defines.MOCK_API = true;
  }

  webpackConfig.entry.app = [ path.join(config.dirs.src, 'index.tsx') ];
  webpackConfig.output.path = getOutputPath(isProduction, enableStats);

  if (isProduction === true) {
    webpackConfig.output.filename = gutil.replaceExtension(config.files.app, '.min.js');
    webpackConfig.devtool = 'sourcemap';

    defines.PRODUCTION = true;
    defines['process.env'] = {
      'NODE_ENV': JSON.stringify('production')
    };

    webpackConfig.plugins = [
      new webpack.DefinePlugin(defines),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        comments: false,
        compress: {
          warnings: false
        }
      }),
      new webpack.optimize.CommonsChunkPlugin('vendor', gutil.replaceExtension(config.files.vendor, '.min.js')),
      new ExtractTextPlugin('[name].min.css')
    ]
  } else {
    webpackConfig.output.filename = gutil.replaceExtension(config.files.app, '.js');
    webpackConfig.devtool = 'sourcemap';
    webpackConfig.debug = true;

    defines.DEBUG = true;

    webpackConfig.plugins = [
      new webpack.DefinePlugin(defines),
      new webpack.optimize.CommonsChunkPlugin('vendor', gutil.replaceExtension(config.files.vendor, '.js')),
      new ExtractTextPlugin('[name].css')
    ];
  }

  if (enableStats === true) {
    webpackConfig.failOnError = false;
    webpackConfig.profile = true;
  }

  if (enableServer === true) {
    webpackConfig.devtool = 'eval';

    webpackConfig.entry.app.unshift('webpack-dev-server/client?' + uri, 'webpack/hot/only-dev-server');

    webpackConfig.module.loaders = [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url' },
      { test: /\.tsx?$/, loaders: ['react-hot', 'ts'] }
    ]

    webpackConfig.plugins.pop(); // remove the css extraction plugin
    webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  return webpackConfig;
}

function writeStats(stats, isProduction, isTest, callback) {
  fs.writeFileSync(
    path.join(isTest ? getOutputPath(isProduction, false, true) : config.dirs.dest, isProduction ? 'stats.min.json' : 'stats.json'),
    JSON.stringify(stats.toJson(), null, 2)
  );

  callback();
}

gulp.task('default', ['browser:server']);
gulp.task('test', ['browser:server:test']);

gulp.task('config', function() {
  gutil.log(config);
})
gulp.task('help', function() {
  var EOL = "\r\n";

  var lines = [
    '*** Help ***',
    'Command Line Overrides:',
    '* --verbose: print webpack module details and stats after bundling',
    '* --force: force deletion of files (requried if path is outside working directory)',
    '* --src <path>: override source directory (default is "src")',
    '* --dest <path>: override build directory (default is "build")',
    '* --dist <path>: override dist directory (default is "dist")',
    '* --test <path>: override test directory (default is "test")',
    '* --publicPath <path>: overrides the public path (default is empty)',
    '* --host <host>: override development server host (default is "0.0.0.0")',
    '* --port <port>: override development server port (default is "3000")',
    '* --testSrc <path>: override mocha test source directory (default is "test")',
    '* --testPort <port>: override mocha test server port (default is "3001")',
    '* --reporter <name>: mocha test reporter (default is "dot", options: "spec", "list", "progress", "min")',
    '',
    'Run ' + gutil.colors.cyan('gulp --tasks') + ' to see complete task hierarchy',
    '',
    '* ' + gutil.colors.cyan('gulp') + ' will build a debug bundle, start a webpack development server, and open a browser window',
    '* ' + gutil.colors.cyan('gulp test') + ' will build a test bundle, start a webpack development server for the tests, and open a browser window',
    '',
    '* ' + gutil.colors.cyan('gulp clean[:dist]') + ' will delete all files in ' + gutil.colors.magenta(path.join(config.dirs.dest)) + ' (or ' + gutil.colors.magenta(path.join(config.dirs.dist)) + ')',
    '* ' + gutil.colors.cyan('gulp help') + ' will emit this help text',
    '* ' + gutil.colors.cyan('gulp config') + ' will emit the build configuration',
    '',
    '* ' + gutil.colors.cyan('gulp build[:*]') + ' will build the bundles (use :dev, or :test for alternate builds)',
    '* ' + gutil.colors.cyan('gulp build:all:bundles') + ' will build release, and dev bundles',
    '* ' + gutil.colors.cyan('gulp build:all:stats') + ' will build release and dev stats',
    '* ' + gutil.colors.cyan('gulp build:all') + ' will build all bundles and stats',
    '',
    '* ' + gutil.colors.cyan('gulp dist[:*]') + ' will build the bundles and deploy them to a dist folder (use :dev for alternate build)',
    '* ' + gutil.colors.cyan('gulp dist:all') + ' will build all bundles and deploy them to a dist folder',
    '',
    '* ' + gutil.colors.cyan('gulp stats[:*]') + ' will create a stats[.*].json file for use with ' + gutil.colors.underline.blue('http://webpack.github.io/analyse/') + ' (use :dev for alternate stats)',
    '',
    '* ' + gutil.colors.cyan('gulp server') + ' will start the webpack development server',
    '* ' + gutil.colors.cyan('gulp server:test') + ' will start the webpack development server for the mocha tests',
    '',
    '* ' + gutil.colors.cyan('gulp index[:*]') + ' will build the bundle and create an index[.*].html test file (use :dev or :test for alternate builds)',
    '',
    '* ' + gutil.colors.cyan('gulp browser[:*]') + ' will build the bundle and create an index[.*].html test file and open a browser window (use :dev or :test for alternate builds)',
    '* ' + gutil.colors.cyan('gulp browser:stats[:*]') + ' will build release stats and open a browser to the analyzer tool (use :dev or :test for alternate stats)',
    '',
    '* ' + gutil.colors.cyan('gulp test:spec') + ' will build the unit test spec file',
    '* ' + gutil.colors.cyan('gulp test:run') + ' will run the unit test spec file in the console',
    '* ' + gutil.colors.cyan('gulp test:watch') + ' will watch for unit test changes and run the unit test spec file in the console'
  ];
  var help = lines.join(EOL);
  gutil.log(help);
})

gulp.task('clean', ['clean:dest', 'clean:dist'], function() {
  return del(['npm-debug.log']);
});
gulp.task('clean:dest', function() {
  return del([path.join(config.dirs.dest, '*')], { force: config.force });
});
gulp.task('clean:dist', function() {
  return del([path.join(config.dirs.dist, '*')], { force: config.force });
});

gulp.task('build', ['webpack:build']);
gulp.task('build:dev', ['webpack:build:dev']);
gulp.task('build:test', ['webpack:build:test']);
gulp.task('build:test:spec', ['webpack:build:test:spec']);
gulp.task('build:all', function(callback) {
  runSequence(
    'build:all:bundles',
    'build:all:stats',
    callback
  );
});
gulp.task('build:all:bundles', function(callback) {
  runSequence(
    'webpack:build:dev',
    'webpack:build',
    callback
  );
});
gulp.task('build:all:stats', function(callback) {
  runSequence(
    'webpack:stats:dev',
    'webpack:stats',
    callback
  );
});

gulp.task('dist', ['webpack:build'], function() {
  gulp
    .src([
      path.join(config.dirs.dest, 'prod', '*.js'),
      path.join(config.dirs.dest, 'prod', '*.css'),
      path.join(config.dirs.dest, 'prod', '*.map'),
      path.join(config.dirs.dest, 'prod', 'fonts', '**', '*'),
      path.join(config.dirs.dest, 'prod', 'locale', '**', '*')
    ], { base: path.join(config.dirs.dest, 'prod') })
    .pipe(gulp.dest(config.dirs.dist));
});
gulp.task('dist:dev', ['webpack:build:dev'], function () {
  gulp
    .src([
      path.join(config.dirs.dest, 'debug', '*.js'),
      path.join(config.dirs.dest, 'debug', '*.css'),
      path.join(config.dirs.dest, 'debug', '*.map'),
      path.join(config.dirs.dest, 'debug', 'fonts', '**', '*'),
      path.join(config.dirs.dest, 'debug', 'locale', '**', '*')
    ], { base: path.join(config.dirs.dest, 'debug') })
    .pipe(gulp.dest(config.dirs.dist));
});
gulp.task('dist:all', ['clean'], function(callback) {
  runSequence(
    'dist:dev',
    'dist',
    callback
  );
});

gulp.task('webpack:build', function(callback) {
  var webpackConfig = configureWebpack(true);

  runWebpack(webpackConfig, 'webpack:build', function() { callback(); });
});

gulp.task('webpack:build:dev', function(callback) {
  var webpackConfig = configureWebpack(false);

  runWebpack(webpackConfig, 'webpack:build:dev', function() { callback(); });
});

gulp.task('webpack:build:test', function(callback) {
  var webpackConfig = Object.create(webpackTestConfigTemplate);

  runWebpack(webpackConfig, 'webpack:build:test', function(stats) {
    writeStats(stats, false, true, callback);
  });
});

gulp.task('webpack:build:test:spec', function(callback) {
  var webpackConfig = Object.create(webpackTestConfigTemplate);
  webpackConfig.entry = path.join(config.test.src, 'index.ts');
  webpackConfig.plugins.pop();

  runWebpack(webpackConfig, 'webpack:build:test:spec', function(stats) {
    writeStats(stats, false, true, callback);
  });
});

gulp.task('stats', ['webpack:stats']);
gulp.task('stats:dev', ['webpack:stats:dev']);

gulp.task('webpack:stats', function(callback) {
  var webpackConfig = configureWebpack(true, true);

  runWebpack(webpackConfig, 'webpack:stats', function(stats) {
    writeStats(stats, true, false, callback);
  });
});

gulp.task('webpack:stats:dev', function(callback) {
  var webpackConfig = configureWebpack(false, true);

  runWebpack(webpackConfig, 'webpack:stats-dev', function(stats) {
    writeStats(stats, false, false, callback);
  });
});

gulp.task('server', ['webpack:dev-server']);
gulp.task('server:test', ['webpack:dev-server:test']);

gulp.task('webpack:dev-server', function(callback) {
  var webpackConfig = configureWebpack(false, false, true);

  var compiler = webpack(webpackConfig);
  compiler.plugin('done', function(stats) {
    gutil.log('[webpack-dev-server]', 'Listening at ' + config.host + ':' + config.port);
    gutil.log('[webpack-dev-server]', uri + '/webpack-dev-server/index.html');

    if (callback) {
      callback();
      callback = null;
    }
  });

  gulp
    .src('index.html')
    .pipe(greplace(/.*stylesheet.*/g, ''))
    .pipe(gulp.dest(config.dirs.dest));

  new WebpackDevServer(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: config.dirs.dest,
    hot: true,
    historyApiFallback: true,
    stats: {
      colors: true
    }
  }).listen(config.port, config.host, function(err, result) {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  });
});

gulp.task('webpack:dev-server:test', ['index:build:test'], function(callback) {
  var webpackConfig = Object.create(webpackTestConfigTemplate);
  webpackConfig.target = 'web';

  webpackConfig.entry.unshift('webpack-dev-server/client?' + testUri, 'webpack/hot/only-dev-server');

  var compiler = webpack(webpackConfig);
  compiler.plugin('done', function(stats) {
    gutil.log('[webpack-dev-server]', 'Listening at ' + config.host + ':' + config.test.port);
    gutil.log('[webpack-dev-server]', uri + '/webpack-dev-server/index.html');

    if (callback) {
      callback();
      callback = null;
    }
  });

  new WebpackDevServer(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: config.dirs.test,
    hot: true,
    stats: {
      colors: true
    }
  }).listen(config.test.port, config.host, function(err, result) {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  });
});

gulp.task('index', ['index:build']);
gulp.task('index:dev', ['index:build:dev']);
gulp.task('index:test', ['index:build:test']);

gulp.task('index:build', function() {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(greplace('app.js', 'app.min.js'))
    .pipe(greplace('vendor.js', 'vendor.min.js'))
    .pipe(greplace('app.css', 'app.min.css'))
    .pipe(greplace('vendor.css', 'vendor.min.css'))
    .pipe(grename('index.min.html'))
    .pipe(gulp.dest(getOutputPath(true)));
});

gulp.task('index:build:dev', function() {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(gulp.dest(getOutputPath(false)));
});

gulp.task('index:build:test', function() {
  gulp
    .src(path.join(config.test.src, 'index.html'))
    .pipe(gulp.dest(getOutputPath(false, false, true)));
});

gulp.task('browser', ['browser:build']);
gulp.task('browser:dev', ['browser:build:dev']);
gulp.task('browser:test', ['browser:build:test']);

gulp.task('browser:build', ['index:build', 'webpack:build'], function() {
  var uri = path.join(getOutputPath(true), 'index.min.html');
  gulp
    .src('')
    .pipe(gopen({ uri: uri }));
});

gulp.task('browser:build:dev', ['index:build:dev', 'webpack:build:dev'], function() {
  var uri = path.join(getOutputPath(false), 'index.html');
  gulp
    .src('')
    .pipe(gopen({ uri: uri }));
});

gulp.task('browser:build:test', ['index:build:test', 'webpack:build:test'], function() {
  var uri = path.join(getOutputPath(false, false, true), 'index.html');
  gulp
    .src('')
    .pipe(gopen({ uri: uri }));
});

gulp.task('browser:server', ['webpack:dev-server'], function() {
  gulp
    .src('')
    .pipe(gopen({ uri: uri }));
})

gulp.task('browser:server:test', ['webpack:dev-server:test'], function() {
  gulp
    .src('')
    .pipe(gopen({ uri: testUri }));
})

gulp.task('browser:stats', ['webpack:stats'], function() {
  gulp
    .src('')
    .pipe(gopen({ uri: 'http://webpack.github.io/analyse/' }));
});

gulp.task('browser:stats:dev', ['webpack:stats:dev'], function() {
  gulp
    .src('')
    .pipe(gopen({ uri: 'http://webpack.github.io/analyse/' }));
});

gulp.task('browser:stats:test', ['webpack:build:test'], function() {
  gulp
    .src('')
    .pipe(gopen({ uri: 'http://webpack.github.io/analyse/' }));
});

gulp.task('test:spec', function(callback) {
  var webpackConfig = Object.create(webpackTestConfigTemplate);
  webpackConfig.entry = path.join(config.test.src, 'index.ts');
  webpackConfig.target = 'node';
  // we need to set an alias for webrx because in the gulp context it doesn't
  // resolve properly
  webpackConfig.resolve.alias.webrx = 'webrx/dist/web.rx.js';
  webpackConfig.plugins.pop();

  runWebpack(webpackConfig, 'test:spec', function(stats) {
    callback();
  });
});

gulp.task('test:run', ['test:spec'], function() {
  var bundle = path.join(config.dirs.test, 'spec.js');

  gutil.log('Testing', gutil.colors.magenta(bundle), '...');

  return gulp
    .src(bundle)
    .pipe(gmocha({ reporter: config.test.reporter }));
});

gulp.task('test:watch', ['test:run'], function() {
  gulp
    .watch([
      path.join(config.test.src, '**', '*.ts'),
      path.join(config.dirs.src, '*')
    ], ['test:run']);
});
