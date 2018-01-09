import * as React from 'react';

import { Property } from '../../../WebRx';

export function validateBindableProperty(property: any) {
  if (BindableInput.wx.isProperty(property) && property.isReadOnly) {
    BindableInput.wx.handleError('BindableInput bound to ReadOnlyProperty', property);
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

export interface BindableInputProps extends BindableProps {
  /**
   * input property (or value)
   */
  boundProperty: any;
}

export interface BindableInputComponentProps extends React.HTMLProps<any>, BindableInputProps {
}

export class BindableInput extends React.Component<BindableInputComponentProps> {
  public static displayName = 'BindableInput';

  static defaultProps = {
    valueProperty: 'value',
    onChangeProperty: 'onChange',
    valueGetter: (property: any) => {
      return BindableInput.wx.isProperty(property) ? property.value : property;
    },
    valueSetter: (property: any, value: any) => {
      if (BindableInput.wx.isProperty(property)) {
        property.value = value;
      }
    },
  };

  componentWillMount() {
    validateBindableProperty(this.props.boundProperty);
  }

  componentWillReceiveProps(nextProps: Readonly<BindableInputComponentProps>) {
    validateBindableProperty(nextProps.boundProperty);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { boundProperty, converter, valueProperty, onChangeProperty, valueGetter, valueSetter } = x;
      return { boundProperty, converter, valueProperty, onChangeProperty, valueGetter, valueSetter };
    });

    const bindProps: any = {};
    const value = this.getValue();
    // NOTE: react says the value of a bindable control should not be null, but
    //       instead empty string (undefined is ok though, so === is required).
    bindProps[props.valueProperty!] = value == null ? '' : value;
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
      return this.props.valueGetter!(this.props.boundProperty);
    }
    catch (e) {
      this.wx.handleError(e);

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

      this.props.valueSetter!(this.props.boundProperty, value);

      this.forceUpdate();
    }
    catch (e) {
      this.wx.handleError(e);
    }
  }
}
