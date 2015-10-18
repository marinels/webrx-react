'use strict';

import * as React from 'react';
import * as wx from 'webrx';

export interface ITextBoxProps {
  binding: wx.IObservableProperty<string>;
}

export class TextBox extends React.Component<ITextBoxProps, any> {
  render() {
    let onChange: React.FormEventHandler = (x) => {
      this.props.binding((x.target as React.HTMLAttributes).value);
    };

    return (
      <input type='text' ref='tb' defaultValue={this.props.binding()} onChange={onChange} />
    );
  }
}

export default TextBox;
