
import { HashCodec } from './HashCodec';
import { Route } from './Interfaces';

export function getPath(state: { route: Route}) {
  let path: string | undefined;

  if (state != null && state.route != null && String.isNullOrEmpty(state.route.path) === false) {
    path = state.route.path;

    delete state.route;
  }

  return path;
}

export function normalizePath(path: string, currentPath?: string, hashCodec?: HashCodec) {
  if (String.isNullOrEmpty(path) === false) {
    if (path[0] !== '/') {
      if (String.isNullOrEmpty(currentPath)) {
        currentPath = (hashCodec || HashCodec.Default).decode(window.location.hash, x => x);
      }

      // relative path
      path = `${ currentPath!.split('/').slice(0, -1).join('/') }/${ path }`;
    }

    // manage relative path elements (..)
    const pathElems = path.split('/');

    for (let i = 0; i < pathElems.length; ++i) {
      if (pathElems[i] === '..') {
        if (i === 0) {
          pathElems.shift();
          --i;
        }
        else {
          pathElems.splice(i - 1, 2);
          i -= 2;
        }
      }
      else if (pathElems[i] === '.') {
        pathElems.splice(i--, 1);
      }
      else if (pathElems[i] === '') {
        // trim out empty path elements (except for the beginning and end)
        if (i > 0 && i < pathElems.length - 1) {
          pathElems.splice(i--, 1);
        }
      }
    }

    path = pathElems.join('/');
  }

  return path;
}
