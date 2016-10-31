import * as React from 'react';
import * as wx from 'webrx';

interface IBindableInputProps extends React.HTMLAttributes {
  property: any;
  converter?: (x: any) => any;
  valueProperty?: string;
  onChangeProperty?: string;
  valueGetter?: (property: any) => any;
  valueSetter?: (property: any, value: any) => void;
}

export class BindableInput extends React.Component<IBindableInputProps, any> {
  public static displayName = 'BindableInput';

  static defaultProps = {
    valueProperty: 'value',
    onChangeProperty: 'onChange',
    valueGetter: (property: wx.IObservableProperty<any>) => { return property(); },
    valueSetter: (property: wx.IObservableProperty<any>, value: any) => { property(value); },
  };

  render() {
    const { rest, props } = this.restProps(x => {
      const { property, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, children } = x;
      return { property, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, children };
    });

    const bindProps: any = {};
    bindProps[props.valueProperty] = props.valueGetter(props.property);
    bindProps[props.onChangeProperty] = (e: React.FormEvent) => this.onChange(e);

    return React.cloneElement(
      React.Children.only(props.children),
      Object.assign({}, rest, bindProps)
    );
  }

  protected onChange(e: React.FormEvent) {
    const target: any = e.target;
    let value: any = target[this.props.valueProperty];

    if (this.props.converter != null) {
      value = this.props.converter(value);
    }

    this.props.valueSetter(this.props.property, value);

    this.forceUpdate();
  }
}
