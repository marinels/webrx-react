import * as React from 'react';
import { Icon } from 'react-fa';
import { FormGroup, InputGroup, FormControl } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { BindableInput } from '../BindableInput/BindableInput';
import { CommandButton } from '../CommandButton/CommandButton';
import { InlineEditViewModel } from './InlineEditViewModel';

import './InlineEdit.less';

interface InlineEditProps extends BaseViewProps {
  valueSelector?: (x: string) => string;
  callBack?: (x: string) => any;
  inputType?: string;
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
              <InputGroup>
                <BindableInput property={ this.state.val } >
                  <FormControl type={ this.getType() } placeholder='Enter new result...' />
                </BindableInput>
                <CommandButton className='UpdateButton' bsStyle='success' command={ this.state.update } commandParameter={ () => this.props.callBack }>
                  <Icon name='check' size='lg' />
                </CommandButton>
                <CommandButton className='CancelButton' bsStyle='danger' command={ this.state.update }>
                  <Icon name='times' size='lg' />
                </CommandButton>
              </InputGroup>
            </FormGroup>
          )
          ,() => (
            <p onClick={ this.bindEventToCommand(x => x.changeMode) }>
              <span>{ this.loadStr(this.props.valueSelector, this.state.val) }</span>
            </p>
          )
        )
        }
      </div>
    );
  }

  private getType(): string {
    return (typeof this.props.inputType === 'string')
      ? this.props.inputType
      : 'text';
  }

  private loadStr(fn: Function, val: wx.IObservableProperty<any>) {
    let strVal = String(val());
    if (typeof fn !== 'function') {
      return strVal;
    }
    return fn(strVal);
  }
}
