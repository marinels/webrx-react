import { Observable } from 'rxjs';

import { ObservableLike } from './Interfaces';
import { getObservable } from './Utils';

export function whenAny<TRet, T1>(
  arg1: ObservableLike<T1>,
  selector: (arg1: T1) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  selector: (arg1: T1, arg2: T2) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  selector: (arg1: T1, arg2: T2, arg3: T3) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  arg5: ObservableLike<T5>,
  selector: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  arg5: ObservableLike<T5>,
  arg6: ObservableLike<T6>,
  selector: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    arg6: T6,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  arg5: ObservableLike<T5>,
  arg6: ObservableLike<T6>,
  arg7: ObservableLike<T7>,
  selector: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    arg6: T6,
    arg7: T7,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  arg5: ObservableLike<T5>,
  arg6: ObservableLike<T6>,
  arg7: ObservableLike<T7>,
  arg8: ObservableLike<T8>,
  selector: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    arg6: T6,
    arg7: T7,
    arg8: T8,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  arg5: ObservableLike<T5>,
  arg6: ObservableLike<T6>,
  arg7: ObservableLike<T7>,
  arg8: ObservableLike<T8>,
  arg9: ObservableLike<T9>,
  selector: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    arg6: T6,
    arg7: T7,
    arg8: T8,
    arg9: T9,
  ) => TRet,
): Observable<TRet>;

export function whenAny<TRet, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  arg1: ObservableLike<T1>,
  arg2: ObservableLike<T2>,
  arg3: ObservableLike<T3>,
  arg4: ObservableLike<T4>,
  arg5: ObservableLike<T5>,
  arg6: ObservableLike<T6>,
  arg7: ObservableLike<T7>,
  arg8: ObservableLike<T8>,
  arg9: ObservableLike<T9>,
  arg10: ObservableLike<T10>,
  selector: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    arg6: T6,
    arg7: T7,
    arg8: T8,
    arg9: T9,
    arg10: T10,
  ) => TRet,
): Observable<TRet>;

export function whenAny(...args: Array<ObservableLike<any>>): Observable<any[]>;

export function whenAny<TRet>(...args: any[]): Observable<TRet> {
  let selector = args.pop();

  if (!(selector instanceof Function)) {
    args.push(selector);

    selector = (...values: any[]) => {
      return values;
    };
  }

  return Observable.combineLatest<any, TRet>(
    ...args.map(x => getObservable(x)),
    selector,
  );
}
