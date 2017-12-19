/// <reference path="./tooling.d.ts" />

import * as path from 'path';
import * as minimist from 'minimist';
import * as cpy from 'cpy';

const options = {
  string: [
    'env.src',
    'env.dest',
  ],
  default: {
    'env.src': path.resolve(__dirname, 'build', 'modules'),
    'env.dest': path.resolve(__dirname),
  },
};

export const args = minimist(process.argv, options);

function copySrcFiles(pattern: string, opts: Partial<cpy.Options> = {}) {
  opts = Object.assign({}, { cwd: 'src', parents: true, nodir: true }, opts);

  return cpy(pattern, args.env.src, opts);
}

copySrcFiles('**/*.less')
  .then(() => copySrcFiles('**/*.d.ts'))
  .then(() => copySrcFiles('Assets/**/*', { ignore: [ 'Assets/index.ts' ] }))
  .then(() => cpy('**/*', args.env.dest, { cwd: args.env.src, parents: true, nodir: true }))
  .then(() => {
    // tslint:disable-next-line no-console
    console.log('all files deployed.');
  });
