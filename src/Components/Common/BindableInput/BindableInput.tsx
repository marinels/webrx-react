import * as React from 'react';

import { wx, Property } from '../../../WebRx';

export function validateBindableProperty(property: any) {
  if (wx.isProperty(property) && property.isReadOnly) {
    wx.handleError('BindableInput bound to ReadOnlyProperty', property);
  }
}

export interface BindableProps {
  /**
   * Action to convert from the view element value to the property value (default is to coerce)
   */
  converter?: (x: any) => any;
  /**
   * Name of the view element value property (default is "value")
   */
  valueProperty?: string;
  /**
   * Name of the view element onChange event (defualt is "onChange")
   */
  onChangeProperty?: string;
  /**
   * Action to perform when fetching the current property value.
   * Default action is to assume an observable property and request the current value.
   */
  valueGetter?: (property: any) => any;
  /**
   * Action to perform when updating the current property value.
   * Default action is to assume an observable property and set the current value.
   */
  valueSetter?: (property: any, value: any) => void;
}

export interface BindableInputProps extends React.HTMLAttributes<BindableInput>, BindableProps {
  /**
   * input property (or value)
   */
  property: any;
}

export class BindableInput extends React.Component<BindableInputProps, any> {
  public static displayName = 'BindableInput';

  static defaultProps = {
    valueProperty: 'value',
    onChangeProperty: 'onChange',
    valueGetter: (property: Property<any>) => { return property.value; },
    valueSetter: (property: Property<any>, value: any) => { property.value = value; },
  };

  componentWillMount() {
    validateBindableProperty(this.props.property);
  }

  componentWillReceiveProps(nextProps: BindableInputProps) {
    validateBindableProperty(nextProps.property);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { property, converter, valueProperty, onChangeProperty, valueGetter, valueSetter } = x;
      return { property, converter, valueProperty, onChangeProperty, valueGetter, valueSetter };
    });

    const bindProps: any = {};
    const value = this.getValue();
    // NOTE: react says the value of a bindable control should not be null, but
    //       instead empty string (undefined is ok though, so === is required).
    bindProps[props.valueProperty!] = value === null ? '' : value;
    bindProps[props.onChangeProperty!] = (e: React.FormEvent<any>) => {
      this.setValue(e);
    };

    return React.cloneElement(
      React.Children.only(children),
      Object.assign({ className }, rest, bindProps),
    );
  }

  protected getValue() {
    try {
      return this.props.valueGetter!(this.props.property);
    }
    catch (e) {
      wx.handleError(e);

      return undefined;
    }
  }

  protected setValue(event: React.FormEvent<any>) {
    try {
      const target: any = event.target;
      let value: any = target[this.props.valueProperty!];

      if (this.props.converter != null) {
        value = this.props.converter(value);
      }

      this.props.valueSetter!(this.props.property, value);

      this.forceUpdate();
    }
    catch (e) {
      wx.handleError(e);
    }
  }
}
