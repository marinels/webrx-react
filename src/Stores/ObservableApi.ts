import { Observable, AjaxRequest, AjaxError } from 'rxjs';
import * as clone from 'clone';
import param = require('jquery-param');

import '../Extensions/String';
import { Logging } from '../Utils';
import { SampleData } from './SampleData/SampleData';

export enum HttpRequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
}

export class ObservableApi {
  public static displayName = 'ObservableApi';

  public static defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  public static getNonNullParams(params?: any) {
    if (params == null) {
      return null;
    }

    for (const key in params) {
      if (params[key] == null) {
        delete params[key];
      }
    }

    return params;
  }

  public static getUriFromParams(uri: string, params: any) {
    // first filter out any empty/null params
    params = this.getNonNullParams(params);

    if (params == null) {
      // if we have no params to append then just return the provided uri verbatim
      return uri;
    }

    // only append params if there are any to append
    if (Object.getOwnPropertyNames(params).length > 0) {
      // first check if our provided uri is already prepped for params
      if (uri.indexOf('?') >= 0) {
        // it has been prepped, so check to see if the last character is an '&'
        if (uri[uri.length - 1] !== '&') {
          // no '&' at the end, so append one
          uri += '&';
        }
      }
      else {
        // it hasn't been prepped so just append a '?'
        uri += '?';
      }

      // finally append our params to the uri
      uri += param(params);
    }

    return uri;
  }

  private readonly logger = Logging.getLogger(ObservableApi.displayName);
  protected sampleData: SampleData;

  constructor(public baseUri?: string) {
    if (String.isNullOrEmpty(this.baseUri) && window != null && window.location != null) {
      this.baseUri = (window.location.origin || 'http://localhost') + (window.location.pathname || '/');
    }
  }

  private getError(xhr: XMLHttpRequest, uri: string) {
    const code = xhr.status > 0 ? xhr.status : null;
    const reason = String.isNullOrEmpty(xhr.statusText) ? null : xhr.statusText;
    const response = String.isNullOrEmpty(xhr.response) ? null : xhr.response;
    let message: string | undefined;
    let messageDetail: string | undefined;

    if (xhr.readyState === 4 && xhr.status === 0) {
      // this is the best heuristic we have for detecting a timeout
      // see: http://stackoverflow.com/a/38097577/2789877

      // NOTE: timeouts can be tested by supplying options param, with an
      // xmlHttpRequest creation function that injects timeout = 1, then
      // use the following as the uri:
      // https://httpbin.org/delay/5

      if (uri.indexOf(window.location.origin) !== 0) {
        // NOTE: it is possible that you can reach this path if you attempt a CORS
        //       fetch where the OPTIONS preflight request 404's.
        // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests

        message = 'Request Timeout or Invalid Cross Origin Request';
      }
      else {
        message = 'Request Timeout';
      }
    }
    else if (response != null) {
      // something came back in the response, so let's try and extract an error

      if (String.isNullOrEmpty(xhr.responseURL) === false) {
        // the responseURL will be more trustworth than our passed in parameter
        uri = xhr.responseURL;
      }

      let responseObject: any;

      if (String.isString(response)) {
        try {
          // try and parse the response as JSON
          responseObject = JSON.parse(response);
        }
        catch (e) {
          this.logger.debug('Unable to parse response', response, e);
          // JSON parsing didn't work, fallback on straight assignment
          message = response;
        }
      }
      else if (typeof response === 'object') {
        responseObject = response;
      }

      if (responseObject != null) {
        // try and get the message and message detail
        message = responseObject.message || responseObject.Message;
        messageDetail = responseObject.messageDetail || responseObject.MessageDetail;
      }

      if (message == null && messageDetail == null) {
        // unable to produce a message yet, so fallback on stringify

        try {
          message = String.stringify(response, null, 2);
        }
        catch (e) {
          this.logger.warn('Unable to stringify response', response);

          // last ditch effort, just call toString on the object
          message = response.toString();
        }
      }
    }
    else {
      // we can't detect what type of error this is, so log the xhr and return a generic message
      this.logger.error('Invalid XHR Error', xhr);

      message = 'Invalid Response from API Host';
    }

    return {
      code,
      reason,
      response,
      message,
      messageDetail,
      uri,
    };
  }

  public getRequest<T>(action: string, url: string, method = HttpRequestMethod.GET, params?: any, data?: any, options?: AjaxRequest) {
    this.logger.debug(`getRequest: [${ method }] ${ action }`, { url, params, data, options });

    url = ObservableApi.getUriFromParams(url, params);

    this.logger.info(`API Request: ${ action } (${ url })`, data);

    const body = data == null ? undefined : String.stringify(data, null, 2);

    options = Object.assign<AjaxRequest>(<AjaxRequest>{
      headers: ObservableApi.defaultHeaders,
      async: true,
      body,
      method: HttpRequestMethod[method],
      url,
    }, options);

    return Observable
      .ajax(options)
      .map(x => {
        try {
          return <T>JSON.parse(x.response);
        }
        catch (e) {
          throw x;
        }
      })
      .do(x => {
        this.logger.info(`API Result: ${ action } (${ url })`, x);
      })
      .catch((x: AjaxError) => {
        this.logger.error(`API  ERROR: ${ action } (${ url })`, x);

        return <Observable<T>>Observable.throw(this.getError(x.xhr, url));
      });
  }

  public getObservableResult<T>(action: string, params?: any, data?: any, method?: HttpRequestMethod, options?: AjaxRequest, baseUri?: string) {
    return Observable
      .defer(() => {
        // use sampleData if it has been defined
        return this.sampleData == null ?
          this.getRequest<T>(action, `${ baseUri || this.baseUri }${ action }`, method, params, data, options) :
          this.sampleData.getObservable<T>(action, params);
      });
  }

  public getObservable<T>(action: string, params?: any, options?: AjaxRequest, baseUri?: string) {
    return this.getObservableResult<T>(action, params, undefined, HttpRequestMethod.GET, options, baseUri);
  }

  public postObservable<T>(action: string, data?: any, params?: any, options?: AjaxRequest, baseUri?: string) {
    return this.getObservableResult<T>(action, params, data, HttpRequestMethod.POST, options, baseUri);
  }

  public getSampleData(name: string, selector: (data: any) => any) {
    const sampleData = (<any>this.sampleData || {})[name];

    return sampleData == null ? null : clone(selector(sampleData));
  }
}
