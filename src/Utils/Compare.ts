import { Enumerable, Comparer as IxComparer } from 'ix';

export interface Comparable<T> {
  compareTo(other: T): number;
}

export function isComparable<T>(obj: any): obj is Comparable<T> {
  return (<Comparable<T>>obj).compareTo instanceof Function;
}

export interface ValueComparison<T> extends IxComparer<T, T> {
}

export interface Comparer<T> {
  compare: ValueComparison<T>;
}

export class ValueComparer<T> implements Comparer<T> {
  public static displayName = 'ValueComparer';

  public static Default: ValueComparer<any> = new ValueComparer<any>();

  public static DefaultComparison(a: any, b: any) {
    if (a === b || (a == null && b == null)) {
      // both are null or the same, so equality is zero
      return 0;
    }
    else if (a == null || b == null) {
      // only one is null, non-null takes higher value
      return a == null ? -1 : 1;
    }
    else if (isComparable(a)) {
      // implements Comparable
      return a.compareTo(b);
    }
    else if (String.isString(a) && String.isString(b)) {
      // native string comparison
      return a.localeCompare(b);
    }
    else {
      // fallback on a basic equality check
      const c: number | undefined = a - b;

      // it's possible that our basic check failed, so default to zero
      return (c == null || isNaN(c)) ? 0 : c;
    }
  }

  constructor(public readonly comparison: ValueComparison<T> = ValueComparer.DefaultComparison) {
  }

  compare(a: T, b: T) {
    return this.comparison(a, b);
  }
}

export enum SortDirection {
  Ascending = 1,
  Descending = 2,
}

export type FieldValueSelector<TObj, TValue> = (source: TObj, field: string) => TValue;

export interface FieldSelector<TObj, TValue> {
  field: string;
  valueSelector?: FieldValueSelector<TObj, TValue>;
}

export interface FieldComparer<TObj, TValue> extends FieldSelector<TObj, TValue>, Comparer<TValue> {
}

export class ObjectComparer<T extends StringMap<any>> {
  public static displayName = 'ObjectComparer';
  public static DefaultComparerKey = '';

  public static createFieldComparer<TObj, TValue>(field: string, compare: ValueComparison<TValue>, valueSelector?: (source: TObj, field: string) => TValue) {
    return {
      field,
      compare: compare,
      valueSelector,
    } as FieldComparer<TObj, TValue>;
  }

  public readonly comparerMap: StringMap<FieldComparer<T, any>>;
  public readonly defaultComparer: FieldComparer<T, any> | undefined;

  constructor(defaultSortField: string | undefined, ...comparers: FieldComparer<T, any>[]);
  constructor(...comparers: FieldComparer<T, any>[]);
  constructor(...args: any[]) {
    const comparers: FieldComparer<T, any>[] = args;
    const defaultSortField = (args[0] == null || !String.isNullOrEmpty(args[0])) ? args.shift() : undefined;

    this.comparerMap = {};

    this.comparerMap[ObjectComparer.DefaultComparerKey] = ObjectComparer
      .createFieldComparer(ObjectComparer.DefaultComparerKey, ValueComparer.DefaultComparison);

    comparers
      .forEach(x => this.comparerMap[x.field] = x);

    if (defaultSortField != null) {
      this.defaultComparer = this.getComparer(defaultSortField);
    }
  }

  public getComparer(field?: string) {
    let comparer = this.comparerMap[field || ObjectComparer.DefaultComparerKey] ||
      this.comparerMap[ObjectComparer.DefaultComparerKey];

    if (String.isNullOrEmpty(comparer.field) && !String.isNullOrEmpty(field)) {
      comparer = Object.assign<FieldComparer<T, any>>({}, comparer, { field });
    }

    return comparer;
  }

  public getCompare(comparer: Comparer<any>) {
    return comparer.compare || ValueComparer.DefaultComparison;
  }

  public getValue(source: T, comparer: FieldComparer<T, any>) {
    return comparer.valueSelector == null ?
      source[comparer.field] :
      comparer.valueSelector(source, comparer.field);
  }

  public sortEnumerable(source: Enumerable<T>, field: string, direction: SortDirection) {
    const comparer = this.getComparer(field);
    const defaultComparer = this.defaultComparer;

    if (direction === SortDirection.Ascending) {
      const orderedSource = source = source
        .orderBy(x => this.getValue(x, comparer), this.getCompare(comparer));

      if (defaultComparer != null) {
        source = orderedSource
          .thenBy(x => this.getValue(x, defaultComparer), this.getCompare(defaultComparer));
      }
    }
    else if (direction === SortDirection.Descending) {
      const orderedSource = source = source
        .orderByDescending(x => this.getValue(x, comparer), comparer.compare);

      if (defaultComparer != null) {
        source = orderedSource
          .thenByDescending(x => this.getValue(x, defaultComparer), this.getCompare(defaultComparer));
      }
    }

    return source;
  }
}
