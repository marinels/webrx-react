import { Comparer as IxComparer } from 'ix';

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

  public static DefaultComparison<T>(a: T, b: T) {
    if (a == null && b == null) {
      // both are null, so equality is zero
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
      return a > b ? 1 : -1;
    }
  }

  public comparison: ValueComparison<T>;

  constructor(comparison?: ValueComparison<T>) {
    if (comparison == null) {
      comparison = ValueComparer.DefaultComparison;
    }

    this.comparison = comparison;
  }

  compare(a: T, b: T) {
    return this.comparison(a, b);
  }
}

export enum SortDirection {
  Ascending = 1,
  Descending = 2,
}

export interface FieldComparer<T> extends Comparer<T> {
  field: string;
  valueSelector?: (source: any, field: string) => T;
}

export class ObjectComparer<T> {
  public static displayName = 'ObjectComparer';
  public static DefaultComparerKey = '';

  public static createFieldComparer<T>(field: string, compare: ValueComparison<T>, valueSelector?: (source: any, field: string) => T) {
    return {
      field,
      compare: compare,
      valueSelector,
    } as FieldComparer<T>;
  }

  private readonly comparers: { [key: string]: FieldComparer<any> } = {};

  constructor(...comparers: FieldComparer<any>[]) {
    for (let i = 0; i < comparers.length; ++i) {
      let comparer = comparers[i];
      this.comparers[comparer.field] = comparer;
    }

    if (this.getComparer() == null) {
      this.comparers[ObjectComparer.DefaultComparerKey] = ObjectComparer.createFieldComparer(ObjectComparer.DefaultComparerKey, ValueComparer.DefaultComparison);
    }
  }

  private getComparer(field?: string) {
    return this.comparers[field || ObjectComparer.DefaultComparerKey] || this.comparers[ObjectComparer.DefaultComparerKey];
  }

  private getValue(source: any, field: string, comparer: FieldComparer<any>) {
    return comparer.valueSelector == null ? source[field] : comparer.valueSelector(source, field);
  }

  public compare(a: T, b: T, field: string, direction: SortDirection) {
    const comparer = this.getComparer(field);

    let result = comparer.compare(this.getValue(a, field, comparer), this.getValue(b, field, comparer));

    if (direction === SortDirection.Descending) {
      result *= -1;
    }

    return result;
  }
}
