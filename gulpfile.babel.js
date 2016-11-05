// we can use sync safely here because it's just the gulp file
// gulp tasks prefer unregulated arrow-body-style
/* eslint-disable no-sync,arrow-body-style */

import File from 'vinyl';
import WebpackDevServer from 'webpack-dev-server';
import clean from 'gulp-rimraf';
import eslint from 'gulp-eslint';
// eslint-disable-next-line id-length
import fs from 'fs';
import mkdirp from 'mkdirp';
import gulp from 'gulp';
import minimist from 'minimist';
import mocha from 'gulp-mocha';
import open from 'gulp-open';
import path from 'path';
import replace from 'gulp-replace';
import runSequence from 'run-sequence';
import stylelint from 'gulp-stylelint';
import through from 'through';
import tsconfigGlob from 'tsconfig-glob';
import tslint from 'gulp-tslint';
import typings from 'gulp-typings';
import util from 'gulp-util';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';

const args = minimist(process.argv);

const webpackAnalyzeUri = 'http://webpack.github.io/analyse/';

const config = {
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
    watch: 'watch',
  },
  files: {
    typings: 'typings.json',
    webpack: 'webpack.config.js',
    stats: 'stats.json',
    index: 'index.html',
  },
  dirs: {
    typings: path.resolve('typings'),
    src: path.resolve('src'),
    test: path.resolve('test'),
    build: path.resolve('build'),
    dist: args.dist || path.resolve('dist'),
  },
  test: {
    reporter: args.reporter || 'spec',
  },
};

function log(...items) {
  if (config.quiet === false) {
    // eslint-disable-next-line prefer-reflect
    util.log.apply(null, items);
  }
}

if (config.verbose) {
  log('Gulp Config:', JSON.stringify(config, null, 2));
}

// Default build task
gulp.task('default', [ 'browser' ]);
// Default test task
gulp.task('test', (done) => {
  runSequence('lint', 'mocha', done);
});
// Default npm test task
gulp.task('npm:test', (done) => {
  runSequence('lint', 'webpack:test', 'mocha:run', 'deploy:release', done);
});

gulp.task('config', () => {
  util.log('Gulp Config:', config);
});

gulp.task('help', () => {
  /* eslint-disable max-len */
  util.log(`*** Gulp Help ***

Command Line Overrides:
  ${ util.colors.cyan('--verbose') }          : print webpack module details and stats after bundling (${ util.colors.magenta(config.verbose) })
  ${ util.colors.cyan('--quiet') }            : do not print any extra build details (${ util.colors.magenta(config.quiet) })
  ${ util.colors.cyan('--profile') }          : provides webpack build profiling in ${ util.colors.magenta(config.files.stats) } (${ util.colors.magenta(config.profile) })
  ${ util.colors.cyan('--lib') }       ${ util.colors.yellow('<path>') } : override lib directory (${ util.colors.magenta(config.dirs.lib) })
  ${ util.colors.cyan('--dist') }      ${ util.colors.yellow('<path>') } : override dist directory (${ util.colors.magenta(config.dirs.dist) })
  ${ util.colors.cyan('--reporter') }  ${ util.colors.yellow('<name>') } : mocha test reporter (${ util.colors.magenta(config.test.reporter) })
             options : ${ [ 'spec', 'list', 'progress', 'dot', 'min' ].map((x) => util.colors.magenta(x)).join(', ') }

Run ${ util.colors.cyan('gulp --tasks') } to see complete task hierarchy

Tasks:
  ${ util.colors.cyan('gulp') } will build a ${ util.colors.yellow('debug') } bundle, start a webpack development server, and open a browser window
  ${ util.colors.cyan('gulp test') } will build a ${ util.colors.yellow('test') } bundle and run mocha against the tests (alias for ${ util.colors.cyan('gulp mocha') })
  ${ util.colors.cyan('gulp help') } will print this help text
  ${ util.colors.cyan('gulp config') } will print the gulp build configuration

  ${ util.colors.cyan('gulp clean') } will delete all files in ${ util.colors.magenta(config.dirs.typings) }, ${ util.colors.magenta(config.dirs.build) }, ${ util.colors.magenta(config.dirs.dist) }
       ${ [ 'typings', 'build', 'dist', 'all' ].map((x) => util.colors.cyan(`clean:${ x }`)).join(', ') }

  ${ util.colors.cyan('gulp typings') } will install typescript definition files via the typings utility (alias for ${ util.colors.cyan('gulp typings:install') })
  ${ util.colors.cyan('gulp typings:ensure') } will run ${ util.colors.cyan('typings:install') } if ${ util.colors.magenta(config.dirs.typings) } is missing

  ${ util.colors.cyan('gulp tsconfig:glob') } will expand ${ util.colors.yellow('filesGlob') } in ${ util.colors.magenta('tsconfig.json') }

  ${ util.colors.cyan('gulp lint') } will lint the source files with ${ util.colors.yellow('eslint') }, ${ util.colors.yellow('tslint') }, and ${ util.colors.yellow('stylelint') }
       ${ [ 'es', 'ts', 'style', 'all' ].map((x) => util.colors.cyan(`lint:${ x }`)).join(', ') }

  ${ util.colors.cyan('gulp webpack') } will build the ${ util.colors.yellow('debug') } bundle using webpack (alias for ${ util.colors.cyan('gulp webpack:debug') })
       ${ [ 'debug', 'release', 'test', 'all' ].map((x) => util.colors.cyan(`webpack:${ x }`)).join(', ') }

  ${ util.colors.cyan('gulp mocha') } will build the ${ util.colors.yellow('test') } bundle and run mocha against the tests
  ${ util.colors.cyan('gulp mocha:run') } will run mocha against the current ${ util.colors.yellow('test') } bundle

  ${ util.colors.cyan('gulp watch') } will start a webpack development server
  ${ util.colors.cyan('gulp watch:mocha') } will start webpack in ${ util.colors.magenta('watch') } mode, and run all tests after any detected change
  ${ util.colors.cyan('gulp watch:lint') } will watch source files for changes and run ${ util.colors.cyan('lint') } after any detected change
  ${ util.colors.cyan('gulp watch:dist') } will watch source files for changes and run ${ util.colors.cyan('dist') } after any detected change
       ${ [ 'debug', 'release' ].map((x) => util.colors.cyan(`watch:dist:${ x }`)).join(', ') }

  ${ util.colors.cyan('gulp index') } will copy (and transform) the ${ util.colors.magenta(config.files.index) } file for builds
       ${ [ 'debug', 'release', 'watch', 'all' ].map((x) => util.colors.cyan(`index:${ x }`)).join(', ') }

  ${ util.colors.cyan('gulp browser') } will open a browser window for a build
       ${ [ 'debug', 'release', 'watch' ].map((x) => util.colors.cyan(`browser:${ x }`)).join(', ') }
  ${ util.colors.cyan('gulp browser:stats') } will open a browser window to ${ util.colors.underline.blue(webpackAnalyzeUri) }

  ${ util.colors.cyan('gulp dist') } will deploy release bundles to ${ util.colors.magenta(config.dirs.dist) }
       ${ [ 'debug', 'release', 'all' ].map((x) => util.colors.cyan(`dist:${ x }`)).join(', ') }

  ${ util.colors.cyan('gulp deploy') } will bundle and deploy release bundles to ${ util.colors.magenta(config.dirs.dist) }
       ${ [ 'debug', 'release', 'all' ].map((x) => util.colors.cyan(`deploy:${ x }`)).join(', ') }
`);
  /* eslint-enable max-len */
});

gulp.task('clean', [ 'clean:all' ]);
gulp.task('clean:all', [ 'clean:typings', 'clean:build', 'clean:dist' ]);

gulp.task('clean:typings', () => {
  const target = config.dirs.typings;

  log('Cleaning', util.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:build', () => {
  const target = config.dirs.build;

  log('Cleaning', util.colors.magenta(target));

  return gulp
    .src(target, { read: false })
    .pipe(clean());
});

gulp.task('clean:dist', () => {
  const target = config.dirs.dist;
  let force = false;

  log('Cleaning', util.colors.magenta(target));

  if (args.dist) {
    force = true;
  }

  return gulp
    .src(target, { read: false })
    .pipe(clean({ force }));
});

gulp.task('typings', [ 'typings:install' ]);

gulp.task('typings:install', () => {
  const target = path.resolve(config.files.typings);

  log('Installing Typings from', util.colors.magenta(target));

  return gulp
    .src(target)
    .pipe(typings());
});

gulp.task('typings:reinstall', [ 'clean:typings' ], (done) => {
  runSequence('typings:install', done);
});

gulp.task('typings:ensure', (done) => {
  let count = 0;

  return gulp
    .src(path.resolve(config.dirs.typings, '**', '*.d.ts'), { read: false })
    .pipe(through(() => {
      ++count;
    }, () => {
      if (count === 0) {
        runSequence('typings:install', done);

        return;
      }

      log('Found', util.colors.magenta(count), 'typescript definitions');

      done();
    }));
});

gulp.task('tsconfig:glob', [ 'typings:ensure' ], () => {
  log('Globbing', util.colors.magenta(path.resolve('tsconfig.json')));

  // eslint-disable-next-line id-match
  return tsconfigGlob({ configPath: path.resolve('.'), indent: 2 });
});

gulp.task('lint', [ 'lint:all' ]);

gulp.task('lint:all', (done) => {
  runSequence('lint:ts', 'lint:es', 'lint:style:css', 'lint:style:less', done);
});

gulp.task('lint:es', () => {
  log('Linting with ESLint...');

  return gulp
    .src([
      path.resolve(config.dirs.src, '**', '*.js'),
      path.resolve(config.dirs.test, '**', '*.js'),
      path.resolve('*.js'),
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('lint:ts', () => {
  log('Linting with TSLint...');

  return gulp
    .src([
      path.resolve(config.dirs.src, '**', '*.ts'),
      path.resolve(config.dirs.src, '**', '*.tsx'),
      path.resolve(config.dirs.test, '**', '*.ts'),
    ])
    .pipe(tslint({
      formatter: 'verbose',
    }))
    .pipe(tslint.report({
      emitError: true,
      summarizeFailureOutput: true,
    }));
});

gulp.task('lint:style', [ 'lint:style:less', 'lint:style:css' ]);

gulp.task('lint:style:less', () => {
  log('Linting with Stylelint:Less...');

  return gulp
    .src(path.resolve(config.dirs.src, '**', '*.less'))
    .pipe(stylelint({
      syntax: 'less',
      failAfterError: true,
      reporters: [
        { formatter: 'string', console: true },
      ],
    }));
});

gulp.task('lint:style:css', () => {
  log('Linting with Stylelint:CSS...');

  return gulp
    .src(path.resolve(config.dirs.src, '**', '*.css'))
    .pipe(stylelint({
      failAfterError: true,
      reporters: [
        { formatter: 'string', console: true },
      ],
    }));
});

function getWebpackConfig(build, uglify) {
  // dynamic loading of the webpack config
  // eslint-disable-next-line global-require
  const webpackConfig = require(path.resolve(build === config.builds.test ? build : '', config.files.webpack));

  if (build === config.builds.debug) {
    webpackConfig.plugins[0].definitions.DEBUG = true;
    webpackConfig.debug = true;
  } else if (build === config.builds.release) {
    if (uglify === true) {
      webpackConfig.output.filename = util.replaceExtension(webpackConfig.output.filename, '.min.js');
    }
    webpackConfig.plugins[0].definitions.RELEASE = true;
    webpackConfig.plugins[0].definitions['process.env'] = {
      'NODE_ENV': JSON.stringify('production'),
    };
    webpackConfig.plugins.push(new webpack.optimize.DedupePlugin());

    if (uglify) {
      webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          minimize: true,
          comments: false,
          compress: {
            warnings: false,
          },
        })
      );
    }
  }

  return webpackConfig;
}

function printAssets(jsonStats, build) {
  const outputPath = path.resolve(config.dirs.build, build);
  const assets = jsonStats.assetsByChunkName;

  for (const chunk in assets) {
    const asset = assets[chunk];

    if (Array.isArray(asset)) {
      for (const i in asset) {
        log(util.colors.magenta(path.resolve(outputPath, asset[i])));
      }
    } else {
      log(util.colors.magenta(path.resolve(outputPath, asset)));
    }
  }
}

function logWebpackIssues(jsonStats) {
  const warnings = jsonStats.warnings || [];
  const errors = jsonStats.errors || [];

  if (warnings.length) {
    log(`${ util.colors.yellow(`${ warnings.length } Warnings`) }:
${ warnings.map((x) => x.replace(/[\r\n]/g, '').trim()).join('\r\n') }`);
  }

  if (errors.length) {
    log(`${ util.colors.red(`${ errors.length } Errors`) }:
${ errors.map((x) => x.replace(/[\r\n]/g, '').trim()).join('\r\n') }`);
  }
}

function onWebpackComplete(build, err, stats, omitAssets) {
  if (err) {
    throw new util.PluginError(`webpack: ${ build }`, err.message);
  }

  if (stats) {
    const jsonStats = stats.toJson() || {};

    if (config.quiet === false) {
      if (config.verbose) {
        log(stats.toString({
          colors: util.colors.supportsColor,
        }));
      } else {
        logWebpackIssues(jsonStats);

        if (!omitAssets) {
          printAssets(jsonStats, build);
        }
      }
    }

    if (config.profile) {
      const statsPath = path.resolve(config.dirs.build, build, config.files.stats);

      log('Writing Webpack Profile Stats to', util.colors.magenta(statsPath));

      if (fs.existsSync(path.dirname(statsPath)) === false) {
        mkdirp.sync(path.dirname(statsPath));
      }

      fs.writeFileSync(statsPath, JSON.stringify(jsonStats, null, 2));
    }
  }
}

function webpackBuild(build, webpackConfig, callback) {
  const target = path.resolve(config.dirs.build, build);

  webpackConfig.output.path = target;
  webpackConfig.output.publicPath = config.publicPath;
  webpackConfig.profile = config.profile;

  log('Bundling', util.colors.yellow(build), 'Build:', util.colors.magenta(target));

  return webpackStream(webpackConfig, null, (err, stats) => {
    if (callback) {
      callback(err, stats);

      return;
    }

    onWebpackComplete(build, err, stats);
  })
  .on('error', () => {
    // webpack-stream errors don't format very nicely
    // errors must be handled in the callback or onWebpackComplete
  });
}

function webpackWatcherStream(webpackConfig, build) {
  const target = path.resolve(config.dirs.build, build);

  webpackConfig.output.path = target;
  webpackConfig.output.publicPath = config.publicPath;
  webpackConfig.profile = config.profile;

  // eslint-disable-next-line prefer-arrow-callback
  const stream = through(() => null, function () {
    // eslint-disable-next-line no-invalid-this
    const self = this;

    const compiler = webpack(webpackConfig, (err, stats) => {
      onWebpackComplete(config.builds.watch, err, stats, true);

      log('watching for changes');
    }).compiler;

    compiler.plugin('compile', () => {
      log('Bundling...');
    });

    compiler.plugin('after-emit', (compilation, callback) => {
      Object.keys(compilation.assets).forEach((outname) => {
        if (compilation.assets[outname].emitted) {
          const filePath = path.resolve(compiler.outputPath, outname);
          const file = new File({
            base: compiler.outputPath,
            path: filePath,
            contents: fs.readFileSync(filePath),
          });

          self.queue(file);
        }
      });
      callback();
    });
  });

  // this makes the stream begin immediately
  stream.end();

  return stream;
}

gulp.task('webpack', [ 'webpack:debug' ]);
gulp.task('webpack:all', (done) => {
  runSequence('webpack:debug', 'webpack:release:min', 'webpack:test', done);
});

gulp.task('webpack:debug', [ 'clean:build', 'tsconfig:glob' ], () => {
  const webpackConfig = getWebpackConfig(config.builds.debug);

  return webpackBuild(config.builds.debug, webpackConfig)
    .pipe(gulp.dest(webpackConfig.output.path));
});

gulp.task('webpack:release', [ 'clean:build', 'tsconfig:glob' ], () => {
  const webpackConfig = getWebpackConfig(config.builds.release);

  return webpackBuild(config.builds.release, webpackConfig)
    .pipe(gulp.dest(webpackConfig.output.path));
});

gulp.task('webpack:release:min', [ 'clean:build', 'tsconfig:glob' ], () => {
  const webpackConfig = getWebpackConfig(config.builds.release, true);

  return webpackBuild(config.builds.release, webpackConfig)
    .pipe(gulp.dest(webpackConfig.output.path));
});

gulp.task('webpack:test', [ 'clean:build', 'tsconfig:glob' ], () => {
  const webpackConfig = getWebpackConfig(config.builds.test);

  return webpackBuild(config.builds.test, webpackConfig)
    .pipe(gulp.dest(webpackConfig.output.path));
});

gulp.task('mocha', (done) => {
  runSequence('webpack:test', 'mocha:run', done);
});

gulp.task('mocha:run', () => {
  const webpackConfig = getWebpackConfig(config.builds.test);
  const target = path.resolve(config.dirs.build, config.builds.test, webpackConfig.output.filename);

  log('Testing with Mocha:', util.colors.magenta(target));

  return gulp
    .src(target)
    .pipe(mocha({ reporter: args.reporter || (config.quiet ? 'dot' : config.test.reporter) }));
});

gulp.task('watch', [ 'watch:webpack' ]);

gulp.task('watch:webpack', [ 'clean:build', 'tsconfig:glob', 'index:watch' ], (done) => {
  const webpackConfig = getWebpackConfig(config.builds.debug);
  const uri = `http://${ config.host === '0.0.0.0' ? 'localhost' : config.host }:${ config.port }`;

  webpackConfig.entry.app.unshift(`webpack-dev-server/client?${ uri }`, 'webpack/hot/only-dev-server');
  webpackConfig.output.path = path.resolve(config.dirs.build, config.builds.watch);
  webpackConfig.output.publicPath = config.publicPath;
  // remove ExtractTextPlugin
  webpackConfig.plugins.pop();
  // eslint-disable-next-line id-match
  webpackConfig.plugins[0].definitions.WEBPACK_DEV_SERVER = true;
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  webpackConfig.devtool = 'eval';
  webpackConfig.watch = true;
  webpackConfig.failOnError = false;
  webpackConfig.debug = true;
  webpackConfig.profile = config.profile;

  webpackConfig.module.loaders = [
    { test: /\.css$/, loader: 'style!css' },
    { test: /\.less$/, loader: 'style!css!less' },
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?mimetype=application/font-woff' },
    { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url' },
    { test: /\.tsx?$/, loaders: [ 'react-hot', 'ts' ] },
  ];

  const compiler = webpack(webpackConfig);

  compiler.plugin('compile', () => {
    log('Bundling...');
  });

  compiler.plugin('done', (stats) => {
    onWebpackComplete(config.builds.watch, null, stats);

    if (done) {
      // eslint-disable-next-line callback-return
      done();
      done = null;

      log('[webpack-dev-server]', `Listening at ${ util.colors.magenta(`${ config.host }:${ config.port }`) }`);
      log('[webpack-dev-server]', util.colors.magenta(`${ uri }/${ config.files.index }`));
      log('[webpack-dev-server]', util.colors.magenta(`${ uri }/webpack-dev-server/${ config.files.index }`));

      return;
    }

    log('watching for changes');
  });

  compiler.plugin('failed', (err) => {
    if (err) {
      throw new util.PluginError(`webpack: ${ config.builds.debug }`, err.message);
    }
  });

  new WebpackDevServer(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve(config.dirs.build, config.builds.watch),
    hot: true,
    historyApiFallback: true,
    quiet: true,
    noInfo: false,
    stats: {
      colors: true,
    },
  }).listen(config.port, config.host, (err) => {
    if (err) {
      throw new util.PluginError('webpack-dev-server', err);
    }
  });
});

gulp.task('watch:mocha', [ 'clean:build', 'tsconfig:glob' ], () => {
  const webpackConfig = getWebpackConfig(config.builds.test);

  webpackConfig.devtool = 'eval';
  webpackConfig.watch = true;
  webpackConfig.failOnError = false;
  webpackConfig.debug = true;

  const reporter = args.reporter || 'dot';

  return webpackBuild(config.builds.test, webpackConfig)
    .on('error', (err) => {
      log(err.message);
    })
    .pipe(gulp.dest(webpackConfig.output.path))
    .pipe(through((file) => {
      log('Testing', file.path, '...');

      gulp
        .src(file.path, { read: false })
        .pipe(mocha({ reporter }))
        .on('error', (err) => {
          log(err.message);
        });
    }));
});

gulp.task('watch:lint', () => {
  runSequence('lint');

  gulp
    .watch([
      path.resolve(config.dirs.src, '**', '*.ts'),
      path.resolve(config.dirs.src, '**', '*.tsx'),
      path.resolve(config.dirs.test, '**', '*.ts'),
      path.resolve(config.dirs.src, '**', '*.js'),
      path.resolve(config.dirs.test, '**', '*.js'),
      path.resolve(config.dirs.src, '**', '*.css'),
      path.resolve(config.dirs.src, '**', '*.less'),
      path.resolve('*.js'),
    ], [ 'lint' ]);
});

gulp.task('watch:dist', [ 'watch:dist:debug' ]);

gulp.task('watch:dist:debug', [ 'clean:build', 'clean:dist', 'tsconfig:glob' ], () => {
  const target = path.resolve(config.dirs.dist, config.builds.debug);
  const webpackConfig = getWebpackConfig(config.builds.debug);

  log('Deploying', util.colors.yellow(config.builds.debug), 'Build to', util.colors.magenta(target));

  webpackConfig.devtool = 'eval';
  webpackConfig.watch = true;
  webpackConfig.failOnError = false;
  webpackConfig.debug = true;

  return webpackWatcherStream(webpackConfig, config.builds.watch)
    .pipe(gulp.dest(target))
    .pipe(through((file) => {
      util.log('Deployed', util.colors.magenta(file.path));
    }));
});

gulp.task('watch:dist:release', [ 'clean:build', 'clean:dist', 'tsconfig:glob' ], () => {
  const target = path.resolve(config.dirs.dist, config.builds.release);
  const webpackConfig = getWebpackConfig(config.builds.release);

  log('Deploying', util.colors.yellow(config.builds.release), 'Build to', util.colors.magenta(target));

  webpackConfig.watch = true;
  webpackConfig.failOnError = false;

  return webpackWatcherStream(webpackConfig, config.builds.watch)
    .pipe(gulp.dest(target))
    .pipe(through((file) => {
      util.log('Deployed', util.colors.magenta(file.path));
    }));
});

gulp.task('index', [ 'index:all' ]);
gulp.task('index:all', [ 'index:debug', 'index:release', 'index:watch' ]);

gulp.task('index:debug', [ 'clean:build' ], () => {
  const target = path.resolve(config.dirs.build, config.builds.debug);

  log('Transforming', util.colors.magenta(path.resolve(target, config.files.index)));

  gulp
    .src(config.files.index)
    .pipe(gulp.dest(target));
});

gulp.task('index:release', [ 'clean:build' ], () => {
  const target = path.resolve(config.dirs.build, config.builds.release);

  log('Transforming', util.colors.magenta(path.resolve(target, config.files.index)));

  gulp
    .src(config.files.index)
    .pipe(gulp.dest(target));
});

gulp.task('index:watch', [ 'clean:build' ], () => {
  const target = path.resolve(config.dirs.build, config.builds.watch);

  log('Transforming', util.colors.magenta(path.resolve(target, config.files.index)));

  gulp
    .src(config.files.index)
    .pipe(replace(/.*stylesheet.*/g, ''))
    .pipe(gulp.dest(target));
});

gulp.task('browser', [ 'browser:watch' ]);

gulp.task('browser:debug', [ 'webpack:debug', 'index:debug' ], () => {
  gulp
    .src('')
    .pipe(open({ uri: path.resolve(config.dirs.build, config.builds.debug, config.files.index) }));
});

gulp.task('browser:release', [ 'webpack:release', 'index:release' ], () => {
  gulp
    .src('')
    .pipe(open({ uri: path.resolve(config.dirs.build, config.builds.release, config.files.index) }));
});

gulp.task('browser:watch', [ 'watch:webpack', 'index:watch' ], () => {
  gulp
    .src('')
    .pipe(open({ uri: `http://${ config.host === '0.0.0.0' ? 'localhost' : config.host }:${ config.port }` }));
});

gulp.task('browser:stats', () => {
  gulp
    .src('')
    .pipe(open({ uri: webpackAnalyzeUri }));
});

gulp.task('dist', [ 'dist:all' ]);
gulp.task('dist:all', (done) => {
  runSequence('dist:debug', 'dist:release', done);
});

gulp.task('dist:debug', [ 'clean:dist' ], () => {
  const target = path.resolve(config.dirs.dist, config.builds.debug);

  log('Deploying', util.colors.yellow(config.builds.debug), 'Build to', util.colors.magenta(target));

  return gulp
    .src(path.resolve(config.dirs.build, config.builds.debug, '**', '*'))
    .pipe(gulp.dest(target))
    .pipe(through((file) => {
      util.log('Deploying', util.colors.magenta(file.path));
    }));
});

gulp.task('dist:release', [ 'clean:dist' ], () => {
  const target = path.resolve(config.dirs.dist, config.builds.release);

  log('Deploying', util.colors.yellow(config.builds.release), 'Build to', util.colors.magenta(target));

  return gulp
    .src(path.resolve(config.dirs.build, config.builds.release, '**', '*'))
    .pipe(gulp.dest(target))
    .pipe(through((file) => {
      util.log('Deploying', util.colors.magenta(file.path));
    }));
});

gulp.task('deploy', [ 'deploy:all' ]);
gulp.task('deploy:all', (done) => {
  runSequence('deploy:debug', 'deploy:release', done);
});

gulp.task('deploy:debug', (done) => {
  runSequence('clean:build', 'webpack:debug', 'dist:debug', done);
});

gulp.task('deploy:release', (done) => {
  runSequence('clean:build', 'webpack:release:min', 'dist:release', done);
});
