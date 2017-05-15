import param = require('jquery-param');
import deparam = require('jquery-deparam');

export class HashCodec {
  public static displayName = 'HashCodec';

  public static readonly NormalizePathPattern = '';
  public static readonly HashPattern = '';

  private normalizePath(path: string) {
    const matches = String.isNullOrEmpty(path) ?
      undefined :
      /^\/*(\/.*?\/?)\/*$/.exec('/' + path);

    return matches == null ? '' : matches[1];
  }

  private getPathAndParams(hash: string) {
    let path: string;
    let params: string | undefined;

    const matches = String.isNullOrEmpty(hash) ?
      undefined :
      /#(\/[^?]*)(\?.*)/g.exec(hash);

    if (matches) {
      path = matches[1];
      params = matches[2];
    }
    else {
      path = hash;

      if (path.length > 0 && path[0] === '#') {
        path = path.substring(1);
      }
    }

    path = decodeURIComponent(this.normalizePath(path));

    return { path, params };
  }

  private santize(hash: string) {
    return (String.isNullOrEmpty(hash) || hash[0] !== '#') ? '#/' : hash;
  }

  public encode(path: string, state?: any, uriEncode = false) {
    let hash = '#' + this.normalizePath(path);

    if (state) {
      let params = param(state);

      if (uriEncode === false) {
        params = decodeURIComponent(params);
      }

      hash += params.length > 0 ? '?' + params : '';
    }

    return hash;
  }

  public decode<T>(hash: string, selector: (path: string, params: string | undefined, state: any) => T) {
    hash = this.santize(hash);

    const { path, params } = this.getPathAndParams(hash);

    let state = {};

    if (params != null && params.length > 0) {
      const obj = deparam(params[0] === '?' ? params.substring(1) : params, true);

      if (obj) {
        state = obj;
      }
    }

    return selector(path, params, state);
  }
}
