import { Observable } from 'rx';

import { ObservableOrProperty } from './Interfaces';
import { isObservable, isProperty, getObservable } from './Utils';

export function whenAny<TRet, T1>(
  arg1: ObservableOrProperty<T1>,
  selector: (
    arg1: T1,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  selector: (
    arg1: T1, arg2: T2,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  arg5: ObservableOrProperty<T5>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
  arg7: ObservableOrProperty<T7>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
  arg7: ObservableOrProperty<T7>, arg8: ObservableOrProperty<T8>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
  arg7: ObservableOrProperty<T7>, arg8: ObservableOrProperty<T8>,
  arg9: ObservableOrProperty<T9>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  arg1: ObservableOrProperty<T1>, arg2: ObservableOrProperty<T2>,
  arg3: ObservableOrProperty<T3>, arg4: ObservableOrProperty<T4>,
  arg5: ObservableOrProperty<T5>, arg6: ObservableOrProperty<T6>,
  arg7: ObservableOrProperty<T7>, arg8: ObservableOrProperty<T8>,
  arg9: ObservableOrProperty<T9>, arg10: ObservableOrProperty<T10>,
  selector: (
    arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10,
  ) => TRet,
): Observable<TRet>;

export function whenAny(
  ...args: ObservableOrProperty<any>[],
): Observable<any[]>;

export function whenAny<TRet>(...args: any[]): Observable<TRet> {
  let selector = args.pop();

  if (isObservable(selector) || isProperty(selector)) {
    args.push(selector);

    selector = function(...values: any[]) {
      return values;
    };
  }

  const sources = args.map(x => getObservable<any>(x));

  return Observable.combineLatest<any, TRet>(sources, selector);
}
