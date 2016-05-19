import * as React from 'react';
import * as wx from 'webrx';

interface IBindableInputProps {
  key?: string | number;
  property: any;
  converter?: (x: any) => any;
  children?: React.ReactNode;
  valueProperty?: string;
  onChangeProperty?: string;
  propSelector?: () => any;
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
    let onChange = (x: any) => {
      let value = x.target[this.props.valueProperty];

      if (this.props.converter != null) {
        value = this.props.converter(value);
      }

      this.props.valueSetter(this.props.property, value);
      this.forceUpdate();
    };

    let props: { [key: string]: any} = {};

    props[this.props.valueProperty] = this.props.valueGetter(this.props.property) || '';
    props[this.props.onChangeProperty] = onChange;

    if (this.props.propSelector != null) {
      props = Object.assign(props, this.props.propSelector());
    }

    let inputComponent = React.Children.only(this.props.children);

    return React.cloneElement(inputComponent, props);
  }
}
