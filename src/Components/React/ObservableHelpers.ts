import { Iterable } from 'ix';
import { Observable, Subscription } from 'rxjs';

import { wx } from '../../WebRx';
import { Alert, Logging } from '../../Utils';

export function logObservable(logger: Logging.Logger, observable: Observable<any>, name: string): Subscription {
  return observable
    .subscribe(
      x => {
        if (x == null) {
          logger.debug(name);
        }
        else if (Object.isObject(x)) {
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
  return Iterable
    .from(Object.keys(source))
    .map(key => ({ key, member: source[key] }))
    .filter(x => wx.isObservable(x.member) || wx.isProperty(x.member) || wx.isCommand(x.member))
    .flatMap(x => {
      if (wx.isCommand(x.member)) {
        return [
          { key: `<${ x.key }>...`, observable: x.member.requests },
          { key: `<${ x.key }>`, observable: x.member.results },
        ];
      }

      return [ { key: x.key, observable: wx.getObservable(x.member) } ];
    })
    .map(x => logObservable(logger, x.observable!, x.key))
    .toArray();
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
