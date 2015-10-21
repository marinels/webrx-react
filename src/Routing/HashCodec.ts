'use strict';

import * as $ from 'jquery';

export class HashCodec {
  private NormalizePath(path: string) {
    let pattern = /^\/*(\/.*?)\/*$/;
    let matches = path ? pattern.exec('/' + path) : null;
    return matches ? matches[1] : '';
  }

  private GetPathAndParams(hash: string) {
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

    return { path: this.NormalizePath(path), params };
  }

  private Santize(hash: string) {
    return (String.isNullOrEmpty(hash) || hash[0] !== '#') ? '#/' : hash;
  }

  public Encode(path: string, state?: Object, uriEncode = false) {
    let hash = '#' + this.NormalizePath(path);

    if (state) {
      let params = $.param(state);

      if (uriEncode === false) {
        params = decodeURIComponent(params);
      }

      hash += params.length > 0 ? '?' + params : '';
    }

    return hash;
  }

  public Decode<T>(hash: string, selector: (path: string, params: string, state: Object) => T) {
    hash = this.Santize(hash);

    let { path, params } = this.GetPathAndParams(hash);

    let state = <Object>{};

    if (params != null && params.length > 0) {
      //let obj = deparam(params[0] === '?' ? params.substring(1) : params, true);

      // if (obj) {
      //   state = obj;
      // }
    }

    return selector(path, params, state);
  }
}

export default HashCodec;
