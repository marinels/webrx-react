import { Observable, Promise, DOM as rxdom } from 'rx-dom';
import * as wx from 'webrx';
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

  private logger = Logging.getLogger(ObservableApi.displayName);
  protected sampleData: SampleData = null;

  constructor(public baseUri?: string) {
    if (String.isNullOrEmpty(this.baseUri) && window != null && window.location != null) {
      this.baseUri = (window.location.origin || 'http://localhost') + (window.location.pathname || '/');
    }
  }

  private getRequest<T>(url: string, method = HttpRequestMethod.GET, params?: any, data?: any, options?: rxdom.AjaxSettings) {
    if (params != null) {
      if (url.indexOf('?') >= 0) {
        if (url[url.length - 1] !== '&') {
          url += '&';
        }
      }
      else {
        url += '?';
      }

      url += param(params);
    }

    const body = data == null ? undefined : String.stringify(data, null, 2);

    options = Object.assign<rxdom.AjaxSettings>(<rxdom.AjaxSettings>{
      async: true,
      body,
      method: HttpRequestMethod[method],
      url,
    }, options);

    return rxdom
      .ajax(options)
      .map(x => {
        try {
          return <T>JSON.parse(x.response);
        }
        catch (e) {
          throw x;
        }
      });
  }

  private getError(xhr: XMLHttpRequest, uri: string) {
    const code = xhr.status > 0 ? xhr.status : null;
    const reason = String.isNullOrEmpty(xhr.statusText) ? null : xhr.statusText;
    const response = String.isNullOrEmpty(xhr.response) ? null : xhr.response;
    let message: string;
    let messageDetail: string;

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

      if (typeof response === 'string') {
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

  public getObservableResult<T>(action: string, params?: any, data?: any, method?: HttpRequestMethod, options?: rxdom.AjaxSettings, baseUri?: string) {
    const uri = `${baseUri || this.baseUri}${action}`;

    this.logger.info(`Calling API: ${action} (${uri})`, params);

    return this.sampleData == null ?
      // if an API call throws an uncaught error, that means you are not subscribing to the observable's error
      this
        .getRequest<T>(uri, method, params, data, options)
        .doOnNext(x => {
          this.logger.info(`API Result: ${action} (${uri})`, x);
        })
        .catch((x: rxdom.AjaxErrorResponse) => {
          this.logger.error(`API ERROR: ${action} (${uri})`, x);

          return Observable.throw<T>(this.getError(x.xhr, uri));
        }) :
      // if sample data has been created just use that instead (opt-in)
      this.sampleData.getObservable<T>(action, params);
  }

  public getObservable<T>(action: string, params?: any, options?: rxdom.AjaxSettings, baseUri?: string) {
    return this.getObservableResult<T>(action, params, undefined, HttpRequestMethod.GET, options, baseUri);
  }

  public postObservable<T>(action: string, data?: any, params?: any, options?: rxdom.AjaxSettings, baseUri?: string) {
    return this.getObservableResult<T>(action, params, data, HttpRequestMethod.POST, options, baseUri);
  }

  public getSampleData(name: string, selector: (data: any) => any) {
    const sampleData = (<any>this.sampleData || {})[name];

    return sampleData == null ? null : clone(selector(sampleData));
  }
}
