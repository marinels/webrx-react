'use strict';

import fs from 'fs';
import path from 'path';
import del from 'del';
import parseArgs from 'minimist';

import gulp from 'gulp';
import gutil from 'gulp-util';
import gopen from 'gulp-open';
import greplace from 'gulp-replace';
import grename from 'gulp-rename';
import runSequence from 'run-sequence';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpackConfigTemplate from './webpack.config.js';
import webpackTestConfigTemplate from './test/webpack.config.js';

let args = parseArgs(process.argv);

const config = {
  verbose: args.verbose || false,
  dirs: {
    src: args.src || path.join(__dirname, 'src'),
    dest: args.dest || path.join(__dirname, 'build'),
    dist: args.dist || (args.dest ? path.join(args.dest, 'dist') : path.join(__dirname, 'build', 'dist')),
    test: args.test || path.join(__dirname, 'test')
  },
  files: {
    app: 'app.js',
    vendor: 'vendor.js'
  },
  host: args.host || '0.0.0.0',
  port: args.port || 3000,
  testPort: args.testPort || 3001
};

const definesTemplate = {
  DEBUG: false,
  PRODUCTION: false,
  COMPAT: false
};

const uri = 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.port;
const testUri = 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.testPort;

function runWebpack(cfg, tag = 'default', callback) {
  tag = '[webpack:' + tag + ']';
  let compiler = webpack(cfg);

  gutil.log(tag, 'Bundling...');
  compiler.run((err, stats) => {
    if (err) {
      throw new gutil.PluginError(tag, err);
    }

    if (args.verbose === true) {
      gutil.log('[webpack:' + tag + ']', stats.toString({
  			colors: true
  		}));
    }

    let outputPath = stats.compilation.outputOptions.path;
    let assets = stats.toJson().assetsByChunkName;

    gutil.log(tag, 'Bundling Complete');
    for (let chunk in assets) {
      let asset = assets[chunk];

      if (Array.isArray(asset)) {
        for (let i in assets[chunk]) {
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

function getOutputPath(isProduction, isCompat, enableStats, isTest) {
  if (isTest === true) {
    return path.join(config.dirs.dest, 'test');
  } else if (enableStats === true) {
    return path.join(config.dirs.dest, 'stats');
  } else if (isCompat === true) {
    return path.join(config.dirs.dest, 'compat');
  } else if (isProduction === true) {
    return path.join(config.dirs.dest, 'prod');
  } else {
    return path.join(config.dirs.dest, 'debug');
  }
}

function configureWebpack(isProduction, isCompat, enableStats, enableServer) {
  let webpackConfig = Object.create(webpackConfigTemplate);
  let defines = Object.create(definesTemplate);

  webpackConfig.entry.app = [ path.join(config.dirs.src, 'index.tsx') ];
  webpackConfig.output.path = getOutputPath(isProduction, isCompat, enableStats);

  if (isProduction === true) {
    webpackConfig.output.filename = gutil.replaceExtension(config.files.app, isCompat ? '.compat.min.js' : '.min.js');

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
      new webpack.optimize.CommonsChunkPlugin('vendor', gutil.replaceExtension(config.files.vendor, isCompat ? '.compat.min.js' : '.min.js')),
      new ExtractTextPlugin('[name].min.css')
    ]
  } else {
    webpackConfig.output.filename = gutil.replaceExtension(config.files.app, isCompat ? '.compat.js' : '.js');
    webpackConfig.devtool = 'sourcemap';
    webpackConfig.debug = true;

    defines.DEBUG = true;

    webpackConfig.plugins = [
      new webpack.DefinePlugin(defines),
      new webpack.optimize.CommonsChunkPlugin('vendor', gutil.replaceExtension(config.files.vendor, isCompat ? '.compat.js' : '.js')),
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
    path.join(isTest ? getOutputPath(isProduction, false, false, true) : config.dirs.dest, isProduction ? 'stats.min.json' : 'stats.json'),
    JSON.stringify(stats.toJson(), null, 2)
  );

  callback();
}

gulp.task('default', ['browser:server']);
gulp.task('test', ['browser:server:test']);

gulp.task('config', () => {
  gutil.log(config);
})
gulp.task('help', () => {
  const EOL = "\r\n";

  let lines = [
    '*** Help ***',
    'Command Line Overrides:',
    '* --verbose: print webpack module details and stats after bundling',
    '* --src <path>: override source directory (default is "src")',
    '* --dest <path>: override build directory (default is "build")',
    '* --dist <path>: override dist directory (default is "dist")',
    '',
    'Run ' + gutil.colors.cyan('gulp --tasks') + ' to see complete task hierarchy',
    '',
    '* ' + gutil.colors.cyan('gulp') + ' will build a debug bundle, start a webpack development server, and open a browser window',
    '',
    '* ' + gutil.colors.cyan('gulp clean') + ' will delete all files in ' + gutil.colors.magenta(path.join(config.dirs.dest)),
    '* ' + gutil.colors.cyan('gulp help') + ' will emit this help text',
    '* ' + gutil.colors.cyan('gulp config') + ' will emit the build configuration',
    '',
    '* ' + gutil.colors.cyan('gulp build[:*]') + ' will build the bundles (use :dev or :compat for alternate builds)',
    '* ' + gutil.colors.cyan('gulp build:all:bundles') + ' will build release, dev, and compat bundles',
    '* ' + gutil.colors.cyan('gulp build:all:stats') + ' will build release and dev stats',
    '* ' + gutil.colors.cyan('gulp build:all') + ' will build all bundles and stats',
    '* ' + gutil.colors.cyan('gulp build:dist') + ' will build all bundles and deploy them to a dist folder',
    '',
    '* ' + gutil.colors.cyan('gulp stats[:*]') + ' will create a stats[.*].json file for use with ' + gutil.colors.underline.blue('http://webpack.github.io/analyse/') + ' (use :dev for alternate stats)',
    '',
    '* ' + gutil.colors.cyan('gulp server') + ' will start the webpack development server',
    '',
    '* ' + gutil.colors.cyan('gulp index[:*]') + ' will build the bundle and create an index[.*].html test file (use :dev or :compat for alternate builds)',
    '',
    '* ' + gutil.colors.cyan('gulp browser[:*]') + ' will build the bundle and create an index[.*].html test file and open a browser window (use :dev or :compat for alternate builds)',
    '* ' + gutil.colors.cyan('gulp browser:stats[:dev]') + ' will build release stats and open a browser to the analyzer tool (:dev for debug stats)'
  ];
  let help = lines.join(EOL);
  gutil.log(help);
})

gulp.task('clean', () => {
  return del([`${config.dirs.dest}/*`, 'npm-debug.log'])
});

gulp.task('build', ['webpack:build']);
gulp.task('build:compat', ['webpack:build:compat']);
gulp.task('build:dev', ['webpack:build:dev']);
gulp.task('build:test', ['webpack:build:test']);
gulp.task('build:all', callback => {
  runSequence(
    'build:all:bundles',
    'build:all:stats',
    callback
  );
});
gulp.task('build:all:bundles', callback => {
  runSequence(
    'webpack:build:dev',
    'webpack:build',
    'webpack:build:compat',
    callback
  );
});
gulp.task('build:all:stats', callback => {
  runSequence(
    'webpack:stats:dev',
    'webpack:stats',
    callback
  );
});
gulp.task('build:dist', ['clean', 'build:all:bundles'], () => {
  gulp
    .src([
      // debug files
      path.join(config.dirs.dest, 'debug', '*.js'),
      path.join(config.dirs.dest, 'debug', '*.css'),
      path.join(config.dirs.dest, 'debug', '*.map'),

      // compat files
      path.join(config.dirs.dest, 'compat', '*.js'),
      path.join(config.dirs.dest, 'compat', '*.js.map'),

      // prod files
      path.join(config.dirs.dest, 'prod', '*.js'),
      path.join(config.dirs.dest, 'prod', '*.css'),
      path.join(config.dirs.dest, 'prod', '*.map'),
      path.join(config.dirs.dest, 'prod', 'fonts'),
      path.join(config.dirs.dest, 'prod', 'locale')
    ])
    .pipe(gulp.dest(config.dirs.dist));
});

gulp.task('webpack:build', callback => {
  let webpackConfig = configureWebpack(true);

  runWebpack(webpackConfig, 'webpack:build', () => callback());
});

gulp.task('webpack:build:compat', callback => {
  let webpackConfig = configureWebpack(true, true);

  webpackConfig.output.filename = gutil.replaceExtension(config.files.app, '.compat.min.js');
  webpackConfig.resolve.alias.rx = 'rx/dist/rx.all.compat';
  webpackConfig.ts = {
    compilerOptions: {
      target: 'es3'
    }
  }

  webpackConfig.entry.vendor.unshift('es5-shim', 'es5-shim/es5-sham');

  runWebpack(webpackConfig, 'webpack:build:compat', () => {
    callback();
  });
});

gulp.task('webpack:build:dev', callback => {
  let webpackConfig = configureWebpack(false);

  runWebpack(webpackConfig, 'webpack:build:dev', () => callback());
});

gulp.task('webpack:build:test', callback => {
  let webpackConfig = Object.create(webpackTestConfigTemplate);

  runWebpack(webpackConfig, 'webpack:build:test', stats => {
    writeStats(stats, false, true, callback);
  });
});

gulp.task('stats', ['webpack:stats']);
gulp.task('stats:dev', ['webpack:stats:dev']);

gulp.task('webpack:stats', callback => {
  let webpackConfig = configureWebpack(true, false, true);

  runWebpack(webpackConfig, 'webpack:stats', stats => {
    writeStats(stats, true, false, callback);
  });
});

gulp.task('webpack:stats:dev', callback => {
  let webpackConfig = configureWebpack(false, false, true);

  runWebpack(webpackConfig, 'webpack:stats-dev', stats => {
    writeStats(stats, false, false, callback);
  });
});

gulp.task('server', ['webpack:dev-server']);
gulp.task('server:test', ['webpack:dev-server:test']);

gulp.task('webpack:dev-server', callback => {
  let webpackConfig = configureWebpack(false, false, false, true);

  let compiler = webpack(webpackConfig);
  compiler.plugin('done', stats => {
    gutil.log('[webpack-dev-server]', 'Listening at ' + config.host + ':' + config.port);
    gutil.log('[webpack-dev-server]', uri + '/webpack-dev-server/index.html');

    callback();
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
  }).listen(config.port, config.host, (err, result) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  });
});

gulp.task('webpack:dev-server:test', callback => {
  let webpackConfig = Object.create(webpackTestConfigTemplate);

  let compiler = webpack(webpackConfig);
  compiler.plugin('done', stats => {
    gutil.log('[webpack-dev-server]', 'Listening at ' + config.host + ':' + config.testPort);
    gutil.log('[webpack-dev-server]', uri + '/webpack-dev-server/index.html');

    callback();
  });

  new WebpackDevServer(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: config.dirs.test,
    hot: true,
    stats: {
      colors: true
    }
  }).listen(config.testPort, config.host, (err, result) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  });
});

//getOutputPath(isProduction, isCompat, enableStats)
gulp.task('index', ['index:build']);
gulp.task('index:compat', ['index:build:compat']);
gulp.task('index:dev', ['index:build:dev']);
gulp.task('index:test', ['index:build:test']);

gulp.task('index:build', ['webpack:build'], () => {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(greplace('app.js', 'app.min.js'))
    .pipe(greplace('vendor.js', 'vendor.min.js'))
    .pipe(grename('index.min.html'))
    .pipe(gulp.dest(getOutputPath(true, false)));
});

gulp.task('index:build:compat', ['webpack:build:compat'], () => {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(greplace('app.js', 'app.compat.min.js'))
    .pipe(greplace('vendor.js', 'vendor.compat.min.js'))
    .pipe(gulp.dest(getOutputPath(true, true)));
});

gulp.task('index:build:dev', ['webpack:build:dev'], () => {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(gulp.dest(getOutputPath(false, false)));
});

gulp.task('index:build:test', ['webpack:build:test'], () => {
  gulp
    .src(path.join(config.dirs.test, 'index.html'))
    .pipe(gulp.dest(getOutputPath(false, false, false, true)));
});

gulp.task('browser', ['browser:build']);
gulp.task('browser:compat', ['browser:build:compat']);
gulp.task('browser:dev', ['browser:build:dev']);
gulp.task('browser:test', ['browser:build:test']);

gulp.task('browser:build', ['index:build'], () => {
  let uri = path.join(getOutputPath(true, false), 'index.min.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:build:compat', ['index:build:compat'], () => {
  let uri = path.join(getOutputPath(true, true), 'index.compat.min.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:build:dev', ['index:build:dev'], () => {
  let uri = path.join(getOutputPath(false, false), 'index.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:build:test', ['index:build:test'], () => {
  let uri = path.join(getOutputPath(false, false, false, true), 'index.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:server', ['webpack:dev-server'], () => {
  gulp
    .src('')
    .pipe(gopen({ uri }));
})

gulp.task('browser:server:test', ['webpack:dev-server:test'], () => {
  gulp
    .src('')
    .pipe(gopen({ uri: testUri }));
})

gulp.task('browser:stats', ['webpack:stats'], () => {
  gulp
    .src('')
    .pipe(gopen({ uri: 'http://webpack.github.io/analyse/' }));
});

gulp.task('browser:stats:dev', ['webpack:stats:dev'], () => {
  gulp
    .src('')
    .pipe(gopen({ uri: 'http://webpack.github.io/analyse/' }));
});
