'use strict';

import * as Rx from 'rx';
import * as $ from 'jquery';
import 'rx.jquery';

export abstract class ObservableApi {
  public static displayName = 'ObservableApi';
  public static EnableStoreApiDebugging = false;

  constructor(public baseUri: string) {
  }

  protected GetObservable<T>(action: string, inputData?: any, dataType = 'json', baseUri?: string) {
    let uri = baseUri + action;

    if (ObservableApi.EnableStoreApiDebugging) {
      console.log(String.format('Calling API: {0} ({1})', action, uri));
    }

    return $.ajaxAsObservable<T>({
      url: uri,
      dataType,
      data: inputData
    });
  }
}

export default ObservableApi;
