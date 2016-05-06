'use strict';

import * as Ix from 'ix';
import * as React from 'react';
import { FormGroup, InputGroup, FormControl, Button, DropdownButton, MenuItem, HelpBlock } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';

import { TimeSpanInputViewModel } from './TimeSpanInputViewModel';

import './TimeSpanInput.less';

interface ITimeSpanInputProps extends IBaseViewProps {
  id: string;
  bsSize?: string;
}

export class TimeSpanInputView extends BaseView<ITimeSpanInputProps, TimeSpanInputViewModel> {
  public static displayName = 'TimeSpanInputView';

  static defaultProps = {
    standalone: false,
  };

  updateOn() {
    return [
      this.state.value.changed,
      this.state.unit.changed,
      this.state.isValid.changed,
      this.state.validationError.changed,
    ];
  }

  render() {
    const isValid = this.state.isValid();
    const validationError = this.state.validationError();

    return (
      <div className='TimeSpanInput'>
        <FormGroup controlId={this.props.id} validationState={isValid ? null : 'error'}>
          <InputGroup>
            <BindableInput property={this.state.text}>
              <FormControl type='text' {...this.props}>
              </FormControl>
            </BindableInput>
            <InputGroup.Button>
              <DropdownButton id={`TimeSpan-units-${this.props.id}`} className='TimeSpan-units' key='units'
                title={this.state.unit().name} bsSize={this.props.bsSize}
                onSelect={this.bindEvent(x => x.setUnit, (e, args) => args[0])}>
                {
                  Ix.Enumerable
                    .fromArray(this.state.units)
                    .select(x => <MenuItem key={x.type} eventKey={x} active={x.type === this.state.unit().type}>{x.name}</MenuItem>)
                    .toArray()
                }
              </DropdownButton>
              <Button key='up' onClick={this.bindEvent(x => x.adjustValue, () => 1)}><Icon name='chevron-up'/></Button>
              <Button key='down' onClick={this.bindEvent(x => x.adjustValue, () => -1)}><Icon name='chevron-down'/></Button>
            </InputGroup.Button>
          </InputGroup>
          <FormControl.Feedback />
          <HelpBlock className={({hidden: isValid})}>{ validationError }</HelpBlock>
        </FormGroup>
      </div>
    );
  }
}

export default TimeSpanInputView;
