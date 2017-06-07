import { Observable, Subscription } from 'rxjs';

import { wx } from '../../WebRx';
import { Alert, Logging } from '../../Utils';

export function logObservable(logger: Logging.Logger, observable: Observable<any>, name: string): Subscription {
  return observable
    .subscribe(
      x => {
        if (x instanceof Object) {
          let value = Object.getName(x);

          if (value === 'Object') {
            value = '';
          }

          logger.debug(`${ name } = ${ value }`, x);
        }
        else {
          logger.debug(`${ name } = ${ x }`);
        }
      },
      e => logger.error(`${ name }: ${ e }`),
    );
}

export function logMemberObservables(logger: Logging.Logger, source: StringMap<any>): Subscription[] {
  return Object
    .keys(source)
    .map(key => ({ key, member: source[key] }))
    .map(x => ({
      key: wx.isCommand(x.member) ? `<${ x.key }>` : x.key,
      observable: wx.isCommand(x.member) ?
        x.member.results :
        ((wx.isObservable(x.member) || wx.isProperty(x.member)) ? wx.getObservable(x.member) : undefined),
    }))
    .filter(x => x.observable != null)
    .map(x => logObservable(logger, x.observable!, x.key));
}

export function getObservableOrAlert<T, TError>(
  observableFactory: () => Observable<T>,
  header?: string,
  style?: string,
  timeout?: number,
  errorFormatter?: (e: TError) => string,
) {
  return Observable
    .defer(observableFactory)
    .catch(err => {
      Alert.createForError(err, header, style, timeout, errorFormatter);

      return Observable.empty<T>();
    });
}

export function getObservableResultOrAlert<TResult, TError>(
  resultFactory: () => TResult,
  header?: string,
  style?: string,
  timeout?: number,
  errorFormatter?: (e: TError) => string,
) {
  return getObservableOrAlert(
    () => wx.getObservable(resultFactory()),
    header,
    style,
    timeout,
    errorFormatter,
  );
}

export function subscribeOrAlert<T, TError>(
  observableFactory: () => Observable<T>,
  header: string,
  onNext: (value: T) => void,
  style?: string,
  timeout?: number,
  errorFormatter?: (e: TError) => string,
): Subscription {
  return getObservableOrAlert(
    observableFactory,
    header,
    style,
    timeout,
    errorFormatter,
  ).subscribe(x => {
    try {
      onNext(x);
    }
    catch (err) {
      Alert.createForError(err, header, style, timeout, errorFormatter);
    }
  });
}
