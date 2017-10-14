import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { wx, IterableLike, ObservableLike, ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';

export class ItemsViewModel<T> extends BaseViewModel {
  public static displayName = 'ItemsViewModel';

  public readonly source: ReadOnlyProperty<IterableLike<T>>;
  public readonly count: ReadOnlyProperty<number>;

  constructor(
    source?: ObservableLike<IterableLike<T>>,
  ) {
    super();

    this.source = this.getObservable(source)
      .map(x => Iterable.from(x))
      .toProperty(Iterable.empty<T>(), false);

    this.count = this
      .whenAny(this.source, x => Iterable.from(x || []).count())
      .toProperty();
  }

  public getItemsSourceProperty(): ReadOnlyProperty<IterableLike<T>> {
    return this.source;
  }

  public getItemsSource() {
    return this.getItemsSourceProperty().value;
  }

  public getItems() {
    return Iterable
      .from(this.getItemsSource());
  }

  public getItemAt(index: number) {
    return this.getItems()
      .elementAt(index);
  }
}
