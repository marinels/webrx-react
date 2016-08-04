export interface IComparable<T> {
  compareTo(other: T): number;
}

export interface IComparer<T> {
  compare: IComparison<T>;
}

export interface IComparison<T> {
  (a: T, b: T): number;
}

export class Comparer<T> implements IComparer<T> {
  public static DefaultComparison: IComparison<any> = (a: any, b: any) => {
    if (a == null && b == null) {
      return 0;
    }
    else if (a == null || b == null) {
      return a == null ? -1 : 1;
    }
    else if (a.compareTo != null && b.compareTo != null) {
      return a.compareTo(b);
    }
    else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    else if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    else {
      return 0;
    }
  };

  public static create<T>(comparison?: IComparison<T>) {
    return new Comparer(comparison || Comparer.DefaultComparison);
  }

  constructor(public comparison: IComparison<T>) {
  }

  compare(a: T, b: T) {
    return this.comparison(a, b);
  }
}

export enum SortDirection {
  Ascending,
  Descending
}

export interface IFieldComparer<T> extends IComparer<T> {
  field: string;
  valueSelector?: (source: any, field: string) => T;
}

export class ObjectComparer<T> {
  public static DefaultComparerKey = '';

  private comparers: { [key: string]: IFieldComparer<any> } = {};

  public static createFieldComparer<T>(field: string, compare: IComparison<T>, valueSelector?: (source: any, field: string) => T) {
    return {
      field,
      compare: compare,
      valueSelector,
    } as IFieldComparer<T>;
  }

  constructor(...comparers: IFieldComparer<any>[]) {
    for (let i = 0; i < comparers.length; ++i) {
      let comparer = comparers[i];
      this.comparers[comparer.field] = comparer;
    }

    if (this.getComparer() == null) {
      this.comparers[ObjectComparer.DefaultComparerKey] = ObjectComparer.createFieldComparer(ObjectComparer.DefaultComparerKey, Comparer.DefaultComparison);
    }
  }

  private getComparer(field?: string) {
    return this.comparers[field || ObjectComparer.DefaultComparerKey] || this.comparers[ObjectComparer.DefaultComparerKey];
  }

  private getValue(source: any, field: string, comparer: IFieldComparer<any>) {
    return comparer.valueSelector == null ? source[field] : comparer.valueSelector(source, field);
  }

  public compare(a: T, b: T, field: string, direction: SortDirection) {
    let comparer = this.getComparer(field);

    let result = comparer.compare(this.getValue(a, field, comparer), this.getValue(b, field, comparer));

    if (direction === SortDirection.Descending) {
      result *= -1;
    }

    return result;
  }
}
