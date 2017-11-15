import { Observable, AjaxRequest } from 'rxjs';

import { ObservableLike } from '../WebRx';

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

export type SampleDataAction = (params: any) => ObservableLike<any>;
export type SampleDataActionSet = StringMap<SampleDataAction>;

export interface SampleDataStore {
  readonly actions: SampleDataActionSet;
}

export interface SampleDataApi {
  observe<T>(action: string, params?: any): Observable<T>;
  getStoreValue<T, TStore extends SampleDataStore>(name: string, selector: (store: TStore) => T): T | undefined;
}

export type SampleDataCreator = () => SampleDataApi;

export interface StoreApi {
  readonly path: string;
  readonly base: string;
  readonly baseUri: string;

  observe<T>(action: string, params?: any, data?: any, method?: HttpRequestMethod, options?: AjaxRequest, baseUri?: string): Observable<T>;
  getObservable<T>(action: string, params?: any, options?: AjaxRequest, baseUri?: string): Observable<T>;
  postObservable<T>(action: string, data?: any, params?: any, options?: AjaxRequest, baseUri?: string): Observable<T>;
  getSampleStoreValue<T, TStore extends SampleDataStore>(name: string, selector: (data: TStore) => T): T | undefined;
}

export interface Store {
  readonly api: StoreApi;
}
