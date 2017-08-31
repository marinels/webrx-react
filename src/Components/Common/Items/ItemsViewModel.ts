import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { wx, IterableLike, ObservableLike, ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';

export class ItemsViewModel<T> extends BaseViewModel {
  public static displayName = 'ItemsViewModel';

  public readonly source: ReadOnlyProperty<IterableLike<T>>;

  constructor(
    source?: ObservableLike<IterableLike<T>>,
  ) {
    super();

    this.source = this.getObservable(source)
      .map(x => Iterable.from(x))
      .toProperty(Iterable.empty<T>(), false);
  }
}
