import { Observable, AjaxRequest, AjaxError } from 'rxjs';
import param = require('jquery-param');

import { Logging } from '../Utils';
import { getWindowLocation, joinPath } from '../Routing';
import { HttpRequestMethod, ObservableApiError, StoreApi } from './Interfaces';

export function sanitizeUri(uri: string) {
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

export function getUriFromParams(uri: string, params: any) {
  // first filter out any empty/null params
  params = Object.trim(params);

  // sanitize the uri
  uri = sanitizeUri(uri);

  // if we have parameters to append then append the encoded params
  if (params != null && Object.keys(params).length > 0) {
    return uri + param(params);
  }

  // otherwise return the sanitized uri as is
  return uri;
}

export function getError(xhr: XMLHttpRequest | undefined, uri: string, logger: Logging.Logger): ObservableApiError {
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

    const windowLocation = getWindowLocation();

    if (windowLocation != null && uri.indexOf(windowLocation.origin) !== 0) {
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

export let defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export function getRequest<T>(action: string, url: string, logger: Logging.Logger, method = HttpRequestMethod.GET, params?: any, data?: any, options?: AjaxRequest) {
  logger.debug(`getRequest: [${ method }] ${ action }`, { url, params, data, options });

  url = getUriFromParams(url, params);

  logger.info(`API Request: ${ action } (${ url })`, data);

  const body = data == null ? undefined : String.stringify(data, null, 2);

  options = Object.assign({
    headers: defaultHeaders,
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

      return Observable.throw(getError(x.xhr, url, logger));
    });
}

export function isStoreApi(value: any): value is StoreApi {
  if (value == null) {
    return false;
  }

  const store: StoreApi = value;

  return (
    String.isString(store.path) &&
    String.isString(store.base) &&
    String.isString(store.baseUri) &&
    store.observe instanceof Function &&
    store.getObservable instanceof Function &&
    store.postObservable instanceof Function &&
    store.getSampleStoreValue instanceof Function
  );
}
