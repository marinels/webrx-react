import { Observable } from 'rx';
import * as clone from 'clone';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';

export class InlineEditViewModel<T> extends BaseViewModel {
  public static displayName = 'InlineEditViewModel';

  public readonly value: Property<T>;
  public readonly editValue: ReadOnlyProperty<T | undefined>;
  public readonly isEditing: ReadOnlyProperty<boolean>;
  public readonly hasSavingError: ReadOnlyProperty<boolean>;

  public readonly edit: Command<T>;
  public readonly save: Command<T>;
  public readonly cancel: Command<undefined>;

  constructor(
    value?: Property<T> | T,
    protected readonly onSave: (value: T, viewModel: InlineEditViewModel<T>) => Observable<T> = x => Observable.of(x),
  ) {
    super();

    if (this.isProperty(value)) {
      this.value = value;
    }
    else {
      this.value = this.property(value);
    }

    this.edit = this.command(() => {
      return clone(this.value.value);
    });

    this.save = this.command(
      () => {
        return Observable
          .defer(() => this.onSave(this.editValue.value!, this))
          .doOnError(e => {
            this.alertForError(e, 'Unable to Save');
          });
      },
    );

    this.cancel = this.command(
      // prevent cancel from being executed while we are waiting for save to respond
      this.save.isExecutingObservable.map(x => x === false),
      // this is intentionally returning undefined to 'reset' the editValue
      () => undefined,
    );

    this.editValue = Observable
      .merge(
        this.edit.results,
        this.save.results,
        this.cancel.results,
      )
      .toProperty();

    this.isEditing = Observable
      .merge(
        this.edit.results.map(() => true),
        this.save.results.map(() => false),
        this.cancel.results.map(() => false),
      )
      .toProperty(false);

    this.hasSavingError = Observable
      .merge(
        this.save.results.map(() => false),
        this.save.thrownErrors.map(() => true),
        this.cancel.results.map(() => false),
      )
      .toProperty(false);

    this.addSubscription(
      this.save.results
        .subscribe(x => {
          this.value.value = x;
        }),
    );
  }
}
