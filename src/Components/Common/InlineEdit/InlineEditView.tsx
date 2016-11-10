import * as React from 'react';
import { Icon } from 'react-fa';
import { FormGroup, FormControl } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { BindableInput } from '../BindableInput/BindableInput';
import { CommandButton } from '../CommandButton/CommandButton';
import InlineEditViewModel from './InlineEditViewModel';

import './InlineEdit.less';

interface InlineEditProps extends BaseViewProps {
  valueSelector?: (x: string) => string;
  callBack?: (x: string) => any;
}

export class InlineEdit extends BaseView<InlineEditProps, InlineEditViewModel> {
  public static displayName = 'InlineEdit';

  updateOn() {
    return [
      this.state.isInEditMode.changed,
    ];
  }

  render() {
    return (
      <div className='InlineEdit'>
        {
          this.renderConditional(this.state.isInEditMode,
          () => (
            <FormGroup>
              <BindableInput property={this.state.val} >
                <FormControl type='number' placeholder='Enter new result...' />
              </BindableInput>
              <CommandButton className='Users-Results-UpdateButton' bsStyle='success' command={ this.state.update } commandParameter={() => this.props.callBack}>
                <Icon name='check' size='lg' />
              </CommandButton>
            </FormGroup>
          )
          ,() => (
            <p onClick={this.bindEventToCommand(x => x.changeMode)}>
              <span>{ this.loadStr(this.props.valueSelector, this.state.val) }</span>
            </p>
          )
        )
        }
      </div>
    );
  }

  private loadStr(fn: Function, val: wx.IObservableProperty<any>) {
    let strVal = String(val());
    if (typeof fn !== 'function') {
      return strVal;
    }
    return fn(strVal);
  }
}

export default InlineEdit;
