import * as clone from 'clone';
import { Observable } from 'rxjs';

import { Command, Property, ReadOnlyProperty } from '../../../WebRx';
import { BaseViewModel } from '../../React';

export class InlineEditViewModel<T> extends BaseViewModel {
  public static displayName = 'InlineEditViewModel';

  public readonly value: Property<T>;
  public readonly editValue: Property<T | undefined>;
  public readonly isEditing: ReadOnlyProperty<boolean>;
  public readonly hasSavingError: ReadOnlyProperty<boolean>;

  public readonly edit: Command<T>;
  public readonly save: Command<T>;
  public readonly cancel: Command<undefined>;
  public readonly setError: Command<boolean>;

  constructor(
    value?: Property<T> | T,
    protected readonly onSave: (
      value: T,
      viewModel: InlineEditViewModel<T>,
    ) => T | Observable<T> = x => x,
  ) {
    super();

    if (this.wx.isProperty(value)) {
      this.value = value;
    } else {
      this.value = this.wx.property(value);
    }

    this.editValue = this.wx.property<T | undefined>();

    this.edit = this.wx.command(() => {
      return clone(this.value.value);
    });

    this.save = this.wx.command(() => {
      return Observable.defer(() =>
        this.wx.asObservable(this.onSave(this.editValue.value!, this)),
      ).do({
        error: e => {
          this.alertForError(e, 'Unable to Save');
        },
      });
    });

    this.cancel = this.wx.command(
      // prevent cancel from being executed while we are waiting for save to respond
      this.save.isExecutingObservable.map(x => x === false),
      // this is intentionally returning undefined to 'reset' the editValue
      () => undefined,
    );

    this.setError = this.wx.command<boolean>();

    this.addSubscription(
      Observable.merge(
        this.edit.results,
        this.save.results.map(x => undefined),
        this.cancel.results,
      ).subscribe(x => {
        this.editValue.value = x;
      }),
    );

    this.isEditing = Observable.merge(
      this.edit.results.map(() => true),
      this.save.results.map(() => false),
      this.cancel.results.map(() => false),
    ).toProperty(false);

    this.hasSavingError = Observable.merge(
      this.save.results.map(() => false),
      this.save.thrownErrors.map(() => true),
      this.cancel.results.map(() => false),
    )
      .startWith(false)
      .combineLatest(
        this.setError.results.startWith(false),
        (hasError, hasManualError) => hasManualError || hasError,
      )
      .toProperty(false);

    this.addSubscription(
      this.save.results.subscribe(x => {
        this.value.value = x;
      }),
    );
  }
}
