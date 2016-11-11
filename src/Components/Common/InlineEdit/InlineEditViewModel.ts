import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';

export class InlineEditViewModel<T> extends BaseViewModel {
  public static displayName = 'InlineEditViewModel';

  public value: wx.IObservableProperty<T>;
  public editValue: wx.IObservableProperty<T>;
  public isEditing: wx.IObservableReadOnlyProperty<boolean>;

  public edit: wx.ICommand<T>;
  public save: wx.ICommand<T>;
  public cancel: wx.ICommand<T>;

  constructor(value?: wx.IObservableProperty<T> | T) {
    super();

    if (wx.isProperty(value) === true) {
      this.value = <wx.IObservableProperty<T>>value;
    }
    else {
      this.value = wx.property(<T>value);
    }

    this.editValue = wx.property<T>();

    this.edit = wx.asyncCommand(() => {
      this.editValue(this.value());

      return Observable.of(this.editValue());
    });
    this.save = wx.asyncCommand(() => {
      this.value(this.editValue());
      this.editValue(null);

      return Observable.of(this.value());
    });
    this.cancel = wx.asyncCommand<T>(() => {
      this.editValue(null);

      return Observable.of(this.editValue());
    });

    this.isEditing = wx
      .whenAny(this.editValue, x => x)
      .map(x => x != null)
      .toProperty();
  }
}
