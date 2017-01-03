import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';

export class InlineEditViewModel<T> extends BaseViewModel {
  public static displayName = 'InlineEditViewModel';

  public value: wx.IObservableProperty<T>;
  public editValue: wx.IObservableProperty<T>;
  public isEditing: wx.IObservableReadOnlyProperty<boolean>;
  public isError: wx.IObservableProperty<boolean>;

  public edit: wx.ICommand<T>;
  public save: wx.ICommand<T>;
  public cancel: wx.ICommand<T>;

  constructor(
    value?: wx.IObservableProperty<T> | T,
    protected onSave: (value: T, thisArg: InlineEditViewModel<T>) => Observable<T> = x => Observable.of(x),
  ) {
    super();

    if (wx.isProperty(value) === true) {
      this.value = <wx.IObservableProperty<T>>value;
    }
    else {
      this.value = wx.property(<T>value);
    }

    this.editValue = wx.property<T>();

    this.edit = wx.asyncCommand(() => {
      const value = <T>((typeof this.value() === 'object')
        ? Object.assign({}, this.value())
        : this.value());

      this.editValue(value);
      return Observable.of(value);
    });

    this.save = wx.asyncCommand(() => {
      return Observable
        .defer(() => {
            this.isError(false);
            return this.onSave(this.editValue(), this);
        })
        .catch(e => {
            this.isError(true);
            this.alertForError(e, 'Unable to Save');

            return Observable.empty<T>();
        })
        .doOnNext(x => {
          this.value(x);
          this.editValue(null);
        });
    });

    this.cancel = wx.asyncCommand<T>(
      this.save.isExecuting.map(x => x === false),
      () => {
        this.editValue(null);
        this.isError(false);

        return Observable.of(null);
      });

    this.isEditing = Observable
      .merge(
        this.edit.results.map(x => true),
        this.save.results.map(x => false),
        this.cancel.results.map(x => false),
      )
      .toProperty();

    this.isError = wx.property(false);
  }
}
