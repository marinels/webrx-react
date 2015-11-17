'use strict';

import * as React from 'react';
import * as wx from 'webrx';

interface IBindableInputProps {
  property: wx.IObservableProperty<string>;
  children?: React.ReactNode;
  valueProperty?: string;
  onChangeProperty?: string;
}

export class BindableInput extends React.Component<IBindableInputProps, any> {
  public static displayName = 'BindableInput';

  render() {
    let valueProp = this.props.valueProperty || 'value';

    let onChange = (x: any) => {
      this.props.property(x.target[valueProp].toString());
      this.forceUpdate();
    };

    let props: { [key: string]: any} = {};
    props[valueProp] = this.props.property();
    props[this.props.onChangeProperty || 'onChange'] = onChange;

    let inputComponent = React.Children.only(this.props.children) as React.ReactElement<any>;

    return React.cloneElement(inputComponent, props);
  }
}

export default BindableInput;
