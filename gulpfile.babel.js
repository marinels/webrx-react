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
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackConfig from './webpack.config.js'

let args = parseArgs(process.argv);

const config = {
  dirs: {
    src: 'src',
    dest: args.dest || 'build'
  },
  filename: 'app.js',
  host: '0.0.0.0',
  port: 3000
};

const uri = 'http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + config.port;

function runWebpack(cfg, tag = 'default', callback) {
  webpack(cfg).run((err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:' + tag, err);
    }

    gutil.log('[webpack:' + tag + ']', stats.toString({
			colors: true
		}));

    gutil.log('[webpack:' + tag + ']', cfg.output.filename);

    if (callback) {
      callback(stats);
    }
  })
}

function configureWebpack() {
  let webpackConfigCopy = Object.create(webpackConfig);
  webpackConfigCopy.output.path = config.dirs.dest;
  webpackConfigCopy.output.filename = gutil.replaceExtension(config.filename, '.min.js');

  webpackConfigCopy.plugins = [
    new webpack.DefinePlugin({ DEBUG: false, PRODUCTION: true,
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      comments: false,
      compress: {
        warnings: false
      }
    })
  ];

  return webpackConfigCopy;
}

function writeStats(stats, filename, callback) {
  fs.writeFileSync(path.join(__dirname, config.dirs.dest, filename), JSON.stringify(stats.toJson(), null, 2));

  callback();
}

gulp.task('default', ['browser:webpack-dev-server']);

gulp.task('clean', () => {
  del([`${config.dirs.dest}/*`, 'npm-debug.log'])
});

gulp.task('build', ['webpack:build']);
gulp.task('build:compat', ['webpack:build:compat']);
gulp.task('build:dev', ['webpack:build:dev']);

gulp.task('webpack:build', callback => {
  let webpackConfigCopy = configureWebpack();

  runWebpack(webpackConfigCopy, 'webpack:build', () => callback());
});

gulp.task('webpack:build:compat', callback => {
  // let webpackConfigCopy = Object.create(webpackConfig);
  // webpackConfigCopy.devtool = 'sourcemap';
  // webpackConfigCopy.debug = true;

  let webpackConfigCopy = configureWebpack();
  webpackConfigCopy.output.filename = gutil.replaceExtension(config.filename, '.compat.min.js');
  webpackConfigCopy.resolve.alias.rx = 'rx/dist/rx.all.compat';
  webpackConfigCopy.ts = {
    compilerOptions: {
      target: 'es3'
    }
  }

  webpackConfigCopy.entry.unshift('es5-shim', 'es5-shim/es5-sham');

  runWebpack(webpackConfigCopy, 'webpack:build:compat', () => {

    callback();
  });
});

gulp.task('webpack:build:dev', callback => {
  let webpackConfigCopy = Object.create(webpackConfig);
  webpackConfigCopy.output.path = config.dirs.dest;
  webpackConfigCopy.output.filename = config.filename;
  webpackConfigCopy.devtool = 'sourcemap';
  webpackConfigCopy.debug = true;

  runWebpack(webpackConfigCopy, 'webpack:build:dev', () => callback());
});

gulp.task('stats', ['webpack:stats']);
gulp.task('stats:dev', ['webpack:stats:dev']);

gulp.task('webpack:stats', callback => {
  let webpackConfigCopy = configureWebpack();
  webpackConfigCopy.failOnError = false;
  webpackConfigCopy.profile = true;

  runWebpack(webpackConfigCopy, 'webpack:stats', stats => {
    writeStats(stats, 'stats.min.json', callback);
  });
});

gulp.task('webpack:stats:dev', callback => {
  let webpackConfigCopy = Object.create(webpackConfig);
  webpackConfigCopy.devtool = 'sourcemap';
  webpackConfigCopy.debug = true;
  webpackConfigCopy.failOnError = false;
  webpackConfigCopy.profile = true;

  runWebpack(webpackConfigCopy, 'webpack:stats-dev', stats => {
    writeStats(stats, 'stats.json', callback);
  });
});

gulp.task('server', ['webpack-dev-server']);

gulp.task('webpack-dev-server', callback => {
  let webpackConfigCopy = Object.create(webpackConfig);
  webpackConfigCopy.devtool = 'eval';
  webpackConfigCopy.debug = true;

  webpackConfigCopy.entry.app.unshift('webpack-dev-server/client?' + uri, 'webpack/hot/only-dev-server');

  webpackConfigCopy.plugins[0].DEBUG = true;
  webpackConfigCopy.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );

  let compiler = webpack(webpackConfigCopy);
  compiler.plugin('done', stats => {
    gutil.log('[webpack-dev-server]', 'Listening at ' + config.host + ':' + config.port);
    gutil.log('[webpack-dev-server]', uri + '/webpack-dev-server/index.html');

    callback();
  });

  new WebpackDevServer(compiler, {
    publicPath: webpackConfigCopy.output.publicPath,
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

gulp.task('index', ['index:build']);
gulp.task('index:compat', ['index:build:compat']);
gulp.task('index:dev', ['index:build:dev']);

gulp.task('index:build', ['webpack:build'], () => {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(greplace(/app\.js/g, 'app.min.js'))
    .pipe(gulp.dest(path.join(__dirname, config.dirs.dest, 'index.min.html')));
});

gulp.task('index:build:compat', ['webpack:build:compat'], () => {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(greplace('app.js', 'app.compat.min.js'))
    .pipe(grename('index.compat.min.html'))
    .pipe(gulp.dest(path.join(__dirname, config.dirs.dest)));
});

gulp.task('index:build:dev', ['webpack:build:dev'], () => {
  gulp
    .src(path.join(__dirname, 'index.html'))
    .pipe(gulp.dest(path.join(__dirname, config.dirs.dest)));
});

gulp.task('browser', ['browser:build']);
gulp.task('browser:compat', ['browser:build:compat']);
gulp.task('browser:dev', ['browser:build:dev']);

gulp.task('browser:build', ['index:build'], () => {
  let uri = path.join(__dirname, config.dirs.dest, 'index.min.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:build:compat', ['index:build:compat'], () => {
  let uri = path.join(__dirname, config.dirs.dest, 'index.compat.min.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:build:dev', ['index:build:dev'], () => {
  let uri = path.join(__dirname, config.dirs.dest, 'index.html');
  gulp
    .src('')
    .pipe(gopen({ uri }));
});

gulp.task('browser:webpack-dev-server', ['webpack-dev-server'], () => {
  gulp
    .src('')
    .pipe(gopen({ uri }));
})
