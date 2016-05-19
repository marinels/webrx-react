import * as param from 'jquery-param';
import * as deparam from 'jquery-deparam';

export class HashCodec {
  public static displayName = 'HashCodec';

  private normalizePath(path: string) {
    let pattern = /^\/*(\/.*?\/?)\/*$/;
    let matches = path ? pattern.exec('/' + path) : null;
    return matches ? matches[1] : '';
  }

  private getPathAndParams(hash: string) {
    let path: string;
    let params: string;
    let pattern = /#(\/[^?]*)(\?.*)/g;

    let matches = hash ? pattern.exec(hash) : null;

    if (matches) {
      path = matches[1];
      params = matches[2];
    } else {
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

  public decode<T>(hash: string, selector: (path: string, params: string, state: any) => T) {
    hash = this.santize(hash);

    let { path, params } = this.getPathAndParams(hash);

    let state = <Object>{};

    if (params != null && params.length > 0) {
      let obj = deparam(params[0] === '?' ? params.substring(1) : params, true);

      if (obj) {
        state = obj;
      }
    }

    return selector(path, params, state);
  }
}
