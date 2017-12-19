/// <reference path="./tooling.d.ts" />

import * as path from 'path';
import * as minimist from 'minimist';
import * as cpy from 'cpy';

const options = {
  string: [
    'env.src',
    'env.dest',
  ],
  boolean: [
    'env.styles',
    'env.declarations',
    'env.modules',
  ],
  default: {
    'env.src': path.resolve(__dirname, 'build', 'modules'),
    'env.dest': path.resolve(__dirname),
    'env.styles': true,
    'env.declarations': true,
    'env.modules': true,
  },
};

export const args = minimist(process.argv, options);

function copySrcFiles(pattern: string) {
  cpy(pattern, args.env.src, { cwd: 'src', parents: true, nodir: true });
}

if (args.env.styles) {
  copySrcFiles('**/*.less');
}

if (args.env.declarations) {
  copySrcFiles('**/*.d.ts');
}

if (args.env.modules) {
  cpy('*', args.env.dest, { cwd: args.env.src, parents: true, nodir: true });
}
