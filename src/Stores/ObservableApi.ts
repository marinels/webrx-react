import { Observable, AjaxRequest, AjaxError } from 'rxjs';
import param = require('jquery-param');

import { Logging } from '../Utils';
import { Manager } from '../Routing/RouteManager';
import { SampleData } from './SampleData/SampleData';

export enum HttpRequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
}

export interface ObservableApiError {
  uri?: string;
  message: string;
  messageDetail?: string;
  code?: number;
  reason?: string;
  response?: any;
}

export class ObservableApi {
  public static displayName = 'ObservableApi';

  public static defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  public static sanitizeUri(uri: string) {
    // first check if our provided uri is already prepped for params
    if (uri.indexOf('?') >= 0) {
      // it has been prepped, so check to see if the last character is an '&'
      if (uri[uri.length - 1] !== '&') {
        // no '&' at the end, so append one
        return uri + '&';
      }
    }
    else {
      // it hasn't been prepped so just append a '?'
      return uri + '?';
    }

    // uri is already sane, just return it
    return uri;
  }

  public static getUriFromParams(uri: string, params: any) {
    // first filter out any empty/null params
    params = Object.trim(params);

    // sanitize the uri
    uri = ObservableApi.sanitizeUri(uri);

    // if we have parameters to append then append the encoded params
    if (params != null && Object.keys(params).length > 0) {
      return uri + param(params);
    }

    // otherwise return the sanitized uri as is
    return uri;
  }

  public static getError(xhr: XMLHttpRequest | undefined, uri: string, logger: Logging.Logger): ObservableApiError {
    if (xhr == null) {
      return {
        message: 'Invalid XMLHttpRequest (null)',
        uri,
      };
    }

    const code = xhr.status > 0 ? xhr.status : undefined;
    const reason = String.isNullOrEmpty(xhr.statusText) ? undefined : xhr.statusText;
    const response = String.isNullOrEmpty(xhr.response) ? undefined : xhr.response;
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

      if (!String.isNullOrEmpty(xhr.responseURL)) {
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
          logger.debug('Unable to parse response', response, e);
          // JSON parsing didn't work, fallback on straight assignment
          message = response;
        }
      }
      else if (Object.isObject(response)) {
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
          logger.warn('Unable to stringify response', response, e);

          // last ditch effort, just call toString on the object
          message = response.toString();
        }
      }
    }
    else {
      // we can't detect what type of error this is, so log the xhr and return a generic message
      logger.error('Invalid XHR Error', xhr);

      message = 'Invalid Response from API Host';
    }

    // message should always be non-null by this point, but just in case have a valid fallback
    if (message == null) {
      logger.error('Unable to extract error message', xhr);

      message = 'Unknown Error';
    }

    return {
      uri,
      message,
      messageDetail,
      code,
      reason,
      response,
    };
  }

  public static getRequest<T>(action: string, url: string, logger: Logging.Logger, method = HttpRequestMethod.GET, params?: any, data?: any, options?: AjaxRequest) {
    logger.debug(`getRequest: [${ method }] ${ action }`, { url, params, data, options });

    url = ObservableApi.getUriFromParams(url, params);

    logger.info(`API Request: ${ action } (${ url })`, data);

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
      .map(x => <T>x.response)
      .do(x => {
        logger.info(`API Result: ${ action } (${ url })`, x);
      })
      .catch<T, T>((x: AjaxError) => {
        logger.error(`API  ERROR: ${ action } (${ url })`, x);

        return Observable.throw(ObservableApi.getError(x.xhr, url, logger));
      });
  }

  protected readonly logger = Logging.getLogger(ObservableApi.displayName);
  protected readonly baseUri: string;

  constructor(public readonly path: string, public readonly base?: string, protected readonly sampleData?: SampleData) {
    if (String.isNullOrEmpty(base) && window != null && window.location != null) {
      this.base = (window.location.origin || 'http://localhost') + (window.location.pathname || '/');
    }

    this.logger.name += ': ' + path;

    this.baseUri = normalizePath(`${ this.base }/${ path }`);
  }

  public getRequest<T>(action: string, url: string, method = HttpRequestMethod.GET, params?: any, data?: any, options?: AjaxRequest) {
    return ObservableApi.getRequest<T>(action, url, this.logger, method, params, data, options);
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

  public getSampleData<T, TData = any>(name: string, selector: (data: TData) => T) {
    if (this.sampleData == null) {
      return undefined;
    }

    return this.sampleData.getData(name, selector);
  }
}
