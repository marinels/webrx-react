'use strict';

var path = require('path');
var fs = require('fs');
var minimist = require('minimist');
var tsconfigGlob = require('tsconfig-glob');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var WebpackDevServer = require('webpack-dev-server');

var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-rimraf');
var tslint = require('gulp-tslint');
var eslint = require('gulp-eslint');
var typings = require('gulp-typings');
var mocha = require('gulp-mocha');
var replace = require('gulp-replace');
var open = require('gulp-open');
var through = require('through');
var runSequence = require('run-sequence');

var args = minimist(process.argv);

var config = {
  verbose: args.verbose || false,
  quiet: args.quiet || false,
  host: args.host || '0.0.0.0',
  port: args.port || 3000,
  publicPath: args.publicPath || '/',
  profile: args.profile || false,
  builds: {
    debug: 'debug',
    release: 'release',
    test: 'test',
    watch: 'watch'
  },
  files: {
    typings: 'typings.json',
    webpack: 'webpack.config.js',
    stats: 'stats.json',
    index: 'index.html'
  },
  dirs: {
    typings: path.join(__dirname, 'typings'),
    src: path.join(__dirname, 'src'),
    test: path.join(__dirname, 'test'),
    build: path.join(__dirname, 'build'),
    dist: args.dist || path.join(__dirname, 'build', 'dist')
  },
  test: {
    reporter: args.reporter || 'spec'
  }
};

function log() {
  if (config.quiet === false) {
    gutil.log.apply(null, arguments);
  }
}

if (config.verbose) {
  log('Gulp Config:', JSON.stringify(config, null, 2));
}

gulp.task('default', ['browser']);  // Default build task
gulp.task('test', ['mocha']);       // Default test task

gulp.task('config', function() {
  gutil.log('Gulp Config:', config);
});

gulp.task('help', function() {
  var lines = [
    '*** Gulp Help ***',
    '',
    'Command Line Overrides:',
    gutil.colors.cyan('--verbose') + ': emit webpack module details and stats after bundling (' + gutil.colors.magenta(config.verbose) + ')',
    gutil.colors.cyan('--quiet') + ': do not emit any extra build details (' + gutil.colors.magenta(config.quiet) + ')',
    gutil.colors.cyan('--host') + ' ' + gutil.colors.yellow('<host>') + ': override development server host (' + gutil.colors.magenta(config.host) + ')',
    gutil.colors.cyan('--port') + ' ' + gutil.colors.yellow('<port>') + ': override development server port (' + gutil.colors.magenta(config.port) + ')',
    gutil.colors.cyan('--publicPath') + ' ' + gutil.colors.yellow('<path>') + ': overrides the public path (' + gutil.colors.magenta(config.publicPath) + ')',
    gutil.colors.cyan('--profile') + ': provides webpack build profiling in ' + gutil.colors.magenta(config.files.stats) + ' (' + gutil.colors.magenta(config.profile) + ')',
    gutil.colors.cyan('--dist') + ' ' + gutil.colors.yellow('<path>') + ': override dist directory (' + gutil.colors.magenta(config.dirs.dist) + ')',
    gutil.colors.cyan('--reporter') + ' ' + gutil.colors.yellow('<name>') + ': mocha test reporter (' + gutil.colors.magenta(config.test.reporter) + ')',
    '          options: ' + ['spec', 'list', 'progress', 'min'].map(function(x) { return gutil.colors.magenta(x); }).join(', '),
    '',
    'Run ' + gutil.colors.cyan('gulp --tasks') + ' to see complete task hierarchy',
    '',
    '* ' + gutil.colors.cyan('gulp') + ' will build a debug bundle, start a webpack development server, and open a browser window',
    '* ' + gutil.colors.cyan('gulp test') + ' will build a test bundle, run Mocha against the tests, and report the results in this console window',
    '',
    '* ' + gutil.colors.cyan('gulp config') + ' will emit the build configuration',
    '* ' + gutil.colors.cyan('gulp help') + ' will emit this help text',
    '',
    '* ' + gutil.colors.cyan('gulp clean') + ' will delete all files in ' + gutil.colors.magenta(config.dirs.build),
    '  ' + ['typings', 'debug', 'release', 'test', 'watch', 'dist', 'build', 'all'].map(function(x) { return gutil.colors.cyan('clean:' + x); }).join(', '),
    '',
    '* ' + gutil.colors.cyan('gulp tsconfig:glob') + ' will expand the ' + gutil.colors.cyan('filesGlob') + ' in the ' + gutil.colors.magenta('tsconfig.json') + ' file',
    '',
    '* ' + gutil.colors.cyan('gulp lint') + ' will scan for coding style rule infractions',
    '  ' + ['ts', 'es'].map(function(x) { return gutil.colors.cyan('lint:' + x); }).join(', '),
    '',
    '* ' + gutil.colors.cyan('gulp webpack') + ' will build the bundles using webpack',
    '  ' + ['debug', 'release', 'test', 'all'].map(function(x) { return gutil.colors.cyan('webpack:' + x); }).join(', '),
    '',
    '* ' + gutil.colors.cyan('gulp mocha') + ' will build the test bundle and run Mocha against the tests (same as ' + gutil.colors.cyan('gulp test') + ')',
    '* ' + gutil.colors.cyan('gulp mocha:test') + ' will run Mocha against the tests (but not build the test bundle)',
    '',
    '* ' + gutil.colors.cyan('gulp watch') + ' will start a webpack development server (same as ' + gutil.colors.cyan('watch:webpack') + ')',
    '* ' + gutil.colors.cyan('gulp watch:mocha') + ' will start webpack in ' + gutil.colors.magenta('watch') + ' mode, and run all tests after any detected change',
    '* ' + gutil.colors.cyan('gulp watch:lint') + ' will watch source files for changes and run lint against them',
    '* ' + gutil.colors.cyan('gulp watch:dist') + ' will watch source files for changes and deploy the bundles to ' + gutil.colors.magenta(config.dirs.dist),
    '  ' + ['debug', 'release'].map(function(x) { return gutil.colors.cyan('watch:dist:' + x); }).join(', '),
    '',
    '* ' + gutil.colors.cyan('gulp index') + ' will copy (and transform) the ' + gutil.colors.magenta(config.files.index) + ' file for builds',
    '  ' + ['debug', 'release', 'watch', 'all'].map(function(x) { return gutil.colors.cyan('index:' + x); }).join(', '),
    '',
    '* ' + gutil.colors.cyan('gulp browser') + ' will open a browser window for a build',
    '  ' + ['debug', 'release', 'watch'].map(function(x) { return gutil.colors.cyan('browser:' + x); }).join(', '),
    '* ' + gutil.colors.cyan('gulp browser:stats') + ' will open a browser window to ' + gutil.colors.underline.blue('http://webpack.github.io/analyse/'),
    '',
    '* ' + gutil.colors.cyan('gulp dist') + ' will copy the bundles to ' + gutil.colors.magenta(config.dirs.dist),
    '  ' + ['debug', 'release', 'all'].map(function(x) { return gutil.colors.cyan('dist:' + x); }).join(', '),
    '',
    '* ' + gutil.colors.cyan('gulp deploy') + ' will build the bundles and copy them to ' + gutil.colors.magenta(config.dirs.dist),
    '  ' + ['debug', 'release', 'all'].map(function(x) { return gutil.colors.cyan('deploy:' + x); }).join(', '),
    ''
  ];

  gutil.log(lines.join(`\r\n`));
});

gulp.task('clean', ['clean:all']);
gulp.task('clean:all', ['clean:typings', 'clean:dist', 'clean:build']);

gulp.task('clean:typings', function() {
  var target = config.dirs.typings;
  log('Cleaning', gutil.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:build', function() {
  var target = config.dirs.build;
  log('Cleaning', gutil.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:debug', function() {
  var target = path.join(config.dirs.build, config.builds.debug);
  log('Cleaning', gutil.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:release', function() {
  var target = path.join(config.dirs.build, config.builds.release);
  log('Cleaning', gutil.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:test', function() {
  var target = path.join(config.dirs.build, config.builds.test);
  log('Cleaning', gutil.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:watch', function() {
  var target = path.join(config.dirs.build, config.builds.watch);
  log('Cleaning', gutil.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:dist', function() {
  var target = path.join(config.dirs.dist);
  log('Cleaning', gutil.colors.magenta(target));

  var force = false;
  if (args.dist) {
    force = true;
  }

  return gulp
    .src([target, config.dirs.dist], { read: false })
    .pipe(clean({ force }));
});

gulp.task('tsconfig:glob', ['typings:ensure'], function() {
  log('Globbing', gutil.colors.magenta(path.join(__dirname, 'tsconfig.json')));

  return tsconfigGlob({ configPath: __dirname, indent: 2 });
});

gulp.task('lint', ['lint:all']);

gulp.task('lint:all', ['lint:ts', 'lint:es']);

gulp.task('lint:es', function() {
  gulp
    .src([
      path.join(config.dirs.src, '**', '*.js'),
      path.join(config.dirs.test, '**', '*.js'),
      path.join(__dirname, '*.js')])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('lint:ts', function() {
  gulp
    .src([
      path.join(config.dirs.src, '**', '*.ts'),
      path.join(config.dirs.src, '**', '*.tsx'),
      path.join(config.dirs.test, '**', '*.ts')])
    .pipe(tslint())
    .pipe(tslint.report('verbose', { emitError: false, summarizeFailureOutput: true }));
});

gulp.task('typings', ['typings:install']);

gulp.task('typings:install', function() {
  return gulp
    .src(path.join(__dirname, config.files.typings))
    .pipe(typings());
});

gulp.task('typings:ensure', function(cb) {
  var count = 0;

  return gulp
    .src(path.join(config.dirs.typings, '**', '*.d.ts'), { read: false })
    .pipe(through(function(file) {
      ++count;
    }, function() {
      if (count === 0) {
        runSequence('typings:install', cb);
      } else {
        log('Found', gutil.colors.magenta(count), 'Typings Files');

        cb();
      }
    }));
});

function getWebpackConfig(build) {
  var webpackConfig = require(path.join(__dirname, build === config.builds.test ? build : '', config.files.webpack));

  if (build === config.builds.debug) {
    webpackConfig.plugins[0].definitions.DEBUG = true;
    webpackConfig.debug = true;
  } else if (build === config.builds.release) {
    webpackConfig.output.filename = gutil.replaceExtension(webpackConfig.output.filename, '.min.js');
    webpackConfig.plugins[0].definitions.RELEASE = true;
    webpackConfig.plugins[0].definitions['process.env'] = {
      'NODE_ENV': JSON.stringify('production')
    };
    webpackConfig.plugins[1].filenameTemplate = gutil.replaceExtension(webpackConfig.plugins[1].filenameTemplate, '.min.js');
    webpackConfig.plugins[2].filename = gutil.replaceExtension(webpackConfig.plugins[2].filename, '.min.css');
    webpackConfig.plugins.push(
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        comments: false,
        compress: {
          warnings: false
        }
      })
    );
  }

  return webpackConfig;
}

function webpackBuild(build, webpackConfig, callback) {
  var target = path.join(config.dirs.build, build);

  webpackConfig.output.path = target;
  webpackConfig.output.publicPath = config.publicPath;
  webpackConfig.profile = config.profile;

  log('Bundling', gutil.colors.yellow(build), 'Build:', gutil.colors.magenta(target));

  return webpackStream(webpackConfig, null, function(err, stats) {
    if (callback) {
      callback(err, stats);
    } else {
      onWebpackComplete(build, err, stats);
    }
  }).on('error', function() {
    this.emit('end');
  })
  .pipe(gulp.dest(webpackConfig.output.path));
}

function onWebpackComplete(build, err, stats) {
  if (err) {
    throw new gutil.PluginError('webpack:' + build, err);
  }

  if (stats) {
    var jsonStats = stats.toJson() || {};

    if (config.quiet === false) {
      if (config.verbose) {
        log(stats.toString({
          colors: gutil.colors.supportsColor
        }));
      } else {
        var errors = jsonStats.errors || [];
        if (errors.length) {
          var errorMessage = errors.reduce(function(resultMessage, nextError) {
            return (resultMessage += nextError.toString().replace(/\r?\n/, `\r\n`) + `\r\n\r\n`);
          }, '');
          log(gutil.colors.red('Error'), errorMessage.trim());
        }

        var outputPath = path.join(config.dirs.build, build);
        var assets = jsonStats.assetsByChunkName;
        for (var chunk in assets) {
          var asset = assets[chunk];

          if (Array.isArray(asset)) {
            for (var i in asset) {
              log(gutil.colors.magenta(path.join(outputPath, asset[i])));
            }
          } else {
            log(gutil.colors.magenta(path.join(outputPath, asset)));
          }
        }
      }
    }

    if (config.profile) {
      var statsPath = path.join(config.dirs.build, build, config.files.stats);
      if (fs.existsSync(path.dirname(statsPath)) === false) {
        fs.mkdirSync(path.dirname(statsPath));
      }
      fs.writeFileSync(statsPath, JSON.stringify(jsonStats, null, 2));
    }
  }
}

gulp.task('webpack', ['webpack:debug']);
gulp.task('webpack:all', function(cb) {
  return runSequence('webpack:debug', 'webpack:release', 'webpack:test', cb);
});

gulp.task('webpack:debug', ['tsconfig:glob'], function(cb) {
  var webpackConfig = getWebpackConfig(config.builds.debug);

  return webpackBuild(config.builds.debug, webpackConfig);
});

gulp.task('webpack:release', ['tsconfig:glob'], function(cb) {
  var webpackConfig = getWebpackConfig(config.builds.release);

  return webpackBuild(config.builds.release, webpackConfig);
});

gulp.task('webpack:test', ['tsconfig:glob'], function(cb) {
  var webpackConfig = getWebpackConfig(config.builds.test);

  return webpackBuild(config.builds.test, webpackConfig);
});

gulp.task('mocha', function(cb) {
  return runSequence('webpack:test', 'mocha:test', cb);
});

gulp.task('mocha:test', function() {
  var webpackConfig = getWebpackConfig(config.builds.test);
  var target = path.join(config.dirs.build, config.builds.test, webpackConfig.output.filename);
  log('Testing with Mocha:', gutil.colors.magenta(target));

  var reporter = args.reporter || (config.quiet ? 'dot' : config.test.reporter);

  return gulp
    .src(target)
    .pipe(mocha({ reporter }));
});

gulp.task('watch', ['watch:webpack']);

gulp.task('watch:webpack', ['tsconfig:glob', 'clean:watch', 'index:watch'], function(cb) {
  var webpackConfig = getWebpackConfig(config.builds.debug);
  var uri = 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.port;

  webpackConfig.entry.app.unshift('webpack-dev-server/client?' + uri, 'webpack/hot/only-dev-server');
  webpackConfig.output.path = path.join(config.dirs.build, config.builds.watch);
  webpackConfig.output.publicPath = config.publicPath;
  webpackConfig.plugins.pop(); // ExtractTextPlugin
  webpackConfig.plugins[0].definitions.WEBPACK_DEV_SERVER = true;
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  webpackConfig.devtool = 'eval';
  webpackConfig.watch = true;
  webpackConfig.profile = config.profile;

  webpackConfig.module.loaders = [
    { test: /\.css$/, loader: 'style!css' },
    { test: /\.less$/, loader: 'style!css!less' },
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?mimetype=application/font-woff' },
    { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url' },
    { test: /\.tsx?$/, loaders: ['react-hot', 'ts'] }
  ];

  var compiler = webpack(webpackConfig);
  compiler.plugin('done', function(stats) {
    onWebpackComplete(config.builds.watch, null, stats);

    if (cb) {
      cb();
      cb = null;

      log('[webpack-dev-server]', 'Listening at' + gutil.colors.magenta(config.host + ':' + config.port));
      log('[webpack-dev-server]', gutil.colors.magenta(uri + '/' + config.files.index));
      log('[webpack-dev-server]', gutil.colors.magenta(uri + '/webpack-dev-server/' + config.files.index));
    } else {
      log('watching for changes');
    }
  });

  new WebpackDevServer(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.join(config.dirs.build, config.builds.watch),
    hot: true,
    historyApiFallback: true,
    quiet: true,
    noInfo: false,
    stats: {
      colors: true
    }
  }).listen(config.port, config.host, function(err, result) {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  });
});

gulp.task('watch:mocha', ['clean:test', 'typings:ensure'], function() {
  var webpackConfig = getWebpackConfig(config.builds.test);

  webpackConfig.devtool = 'eval';
  webpackConfig.debug = true;

  var reporter = args.reporter || 'dot';

  webpackBuild(config.builds.test, webpackConfig)
    .pipe(mocha({ reporter }))
    .on('error', function() {});

  return gulp
    .watch([
      path.join(config.dirs.src, '**', '*.ts'),
      path.join(config.dirs.src, '**', '*.tsx'),
      path.join(config.dirs.test, '**', '*.ts')
    ], function() {
      webpackBuild(config.builds.test, webpackConfig)
        .pipe(through(function(file) {
          log('Testing', gutil.colors.magenta(file.path), '...');

          gulp
            .src(file.path)
            .pipe(mocha({ reporter }))
            .on('error', function() {});
        }));
    });
});

gulp.task('watch:lint', ['lint'], function() {
  gulp
    .watch([
      path.join(config.dirs.src, '**', '*.ts'),
      path.join(config.dirs.src, '**', '*.tsx'),
      path.join(config.dirs.test, '**', '*.ts'),
      path.join(config.dirs.src, '**', '*.js'),
      path.join(config.dirs.test, '**', '*.js'),
      path.join(__dirname, '*.js')], ['lint'])
    .on('change', function(e) {
      log('linting...');
    });
});

gulp.task('watch:dist', ['watch:dist:debug']);

gulp.task('watch:dist:debug', ['tsconfig:glob'], function() {
  var target = path.join(config.dirs.dist, config.builds.debug);
  log('Deploying', gutil.colors.yellow(config.builds.debug), 'Build to', gutil.colors.magenta(target));

  var webpackConfig = getWebpackConfig(config.builds.debug);

  webpackConfig.watch = true;

  return webpackBuild(config.builds.debug, webpackConfig, function() {})
    .pipe(gulp.dest(target))
    .pipe(through(function(file) {
      gutil.log('Deploying', gutil.colors.magenta(file.path));
    }));
});

gulp.task('watch:dist:release', ['tsconfig:glob'], function() {
  var target = path.join(config.dirs.dist, config.builds.release);
  log('Deploying', gutil.colors.yellow(config.builds.release), 'Build to', gutil.colors.magenta(target));

  var webpackConfig = getWebpackConfig(config.builds.release);

  webpackConfig.watch = true;

  return webpackBuild(config.builds.release, webpackConfig, function() {})
    .pipe(gulp.dest(target))
    .pipe(through(function(file) {
      gutil.log('Deploying', gutil.colors.magenta(file.path));
    }));
});

gulp.task('index', ['index:all']);
gulp.task('index:all', ['index:debug', 'index:release', 'index:watch']);

gulp.task('index:debug', ['clean:debug'], function() {
  var target = path.join(config.dirs.build, config.builds.debug);
  log('Transforming', gutil.colors.magenta(path.join(target, config.files.index)));

  gulp
    .src(config.files.index)
    .pipe(gulp.dest(target));
});

gulp.task('index:release', ['clean:release'], function() {
  var target = path.join(config.dirs.build, config.builds.release);
  log('Transforming', gutil.colors.magenta(path.join(target, config.files.index)));

  gulp
    .src(config.files.index)
    .pipe(gulp.dest(target));
});

gulp.task('index:watch', ['clean:watch'], function() {
  var target = path.join(config.dirs.build, config.builds.watch);
  log('Transforming', gutil.colors.magenta(path.join(target, config.files.index)));

  gulp
    .src(config.files.index)
    .pipe(replace(/.*stylesheet.*/g, ''))
    .pipe(gulp.dest(target));
});

gulp.task('browser', ['browser:watch']);

gulp.task('browser:debug', ['webpack:debug', 'index:debug'], function() {
  gulp
    .src('')
    .pipe(open({ uri: path.join(config.dirs.build, config.builds.debug, config.files.index) }));
});

gulp.task('browser:release', ['webpack:release', 'index:release'], function() {
  gulp
    .src('')
    .pipe(open({ uri: path.join(config.dirs.build, config.builds.release, config.files.index) }));
});

gulp.task('browser:watch', ['watch:webpack', 'index:watch'], function() {
  gulp
    .src('')
    .pipe(open({ uri: 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.port }));
});

gulp.task('browser:stats', function() {
  gulp
    .src('')
    .pipe(open({ uri: 'http://webpack.github.io/analyse/' }));
});

gulp.task('dist', ['dist:all']);
gulp.task('dist:all', ['dist:debug', 'dist:release']);

gulp.task('dist:debug', function() {
  var target = path.join(config.dirs.dist, config.builds.debug);
  log('Deploying', gutil.colors.yellow(config.builds.debug), 'Build to', gutil.colors.magenta(target));

  return gulp
    .src(path.join(config.dirs.build, config.builds.debug, '**', '*'))
    .pipe(gulp.dest(target))
    .pipe(through(function(file) {
      gutil.log('Deploying', gutil.colors.magenta(file.path));
    }));
});

gulp.task('dist:release', function() {
  var target = path.join(config.dirs.dist, config.builds.release);
  log('Deploying', gutil.colors.yellow(config.builds.release), 'Build to', gutil.colors.magenta(target));

  return gulp
    .src(path.join(config.dirs.build, config.builds.release, '**', '*'))
    .pipe(gulp.dest(target))
    .pipe(through(function(file) {
      gutil.log('Deploying', gutil.colors.magenta(file.path));
    }));
});

gulp.task('deploy', ['deploy:all']);
gulp.task('deploy:all', function(cb) {
  return runSequence('deploy:debug', 'deploy:release', cb);
});

gulp.task('deploy:debug', function(cb) {
  return runSequence('webpack:debug', 'dist:debug', cb);
});

gulp.task('deploy:release', function(cb) {
  return runSequence('webpack:release', 'dist:release', cb);
});
