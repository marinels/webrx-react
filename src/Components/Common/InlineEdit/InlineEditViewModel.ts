import { Observable } from 'rx';
import * as wx from 'webrx';
import * as clone from 'clone';

import { BaseViewModel } from '../../React/BaseViewModel';

export class InlineEditViewModel<T> extends BaseViewModel {
  public static displayName = 'InlineEditViewModel';

  public value: wx.IObservableProperty<T>;
  public editValue: wx.IObservableProperty<T | undefined>;
  public isEditing: wx.IObservableReadOnlyProperty<boolean>;
  public hasSavingError: wx.IObservableProperty<boolean>;

  public edit: wx.ICommand<T>;
  public save: wx.ICommand<T>;
  public cancel: wx.ICommand<T | undefined>;

  constructor(
    value?: wx.IObservableProperty<T> | T,
    protected onSave: (value: T, viewModel: InlineEditViewModel<T>) => Observable<T> = x => Observable.of(x),
  ) {
    super();

    this.hasSavingError = wx.property(false);

    if (wx.isProperty(value) === true) {
      this.value = <wx.IObservableProperty<T>>value;
    }
    else {
      this.value = wx.property(<T>value);
    }

    this.editValue = wx.property<T | undefined>();

    this.edit = wx.asyncCommand(() => {
      const editVal = clone(this.value());
      this.editValue(editVal);

      return Observable.of(editVal);
    });

    this.save = wx.asyncCommand(() => {
      return Observable
        .defer(() => this.onSave(this.editValue()!, this))
        .doOnNext(x => {
          // reset the error flag since we received a result
          this.hasSavingError(false);

          // copy our edit value to our display value
          this.value(x);

          // clear the edit value
          this.editValue(undefined);
        })
        .catch(e => {
          // set the error flag
          this.hasSavingError(true);

          this.alertForError(e, 'Unable to Save');

          return Observable.empty<T>();
        });
    });

    this.cancel = wx.asyncCommand<T | undefined>(
      this.save.isExecuting.map(x => x === false),
      () => {
        this.editValue(undefined);

        // clear the edit value
        this.hasSavingError(false);

        return Observable.of(undefined);
      });

    this.isEditing = Observable
      .merge(
        this.edit.results.map(x => true),
        this.save.results.map(x => false),
        this.cancel.results.map(x => false),
      )
      .toProperty();
  }
}
