import * as React from 'react';
import { Enumerable } from 'ix';
import { FormGroup, InputGroup, FormControl, Button, DropdownButton, MenuItem, HelpBlock } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { BindableInput } from '../BindableInput/BindableInput';
import { TimeSpanInputViewModel } from './TimeSpanInputViewModel';

import './TimeSpanInput.less';

export interface TimeSpanInputProps extends BaseViewProps {
  id: string;
  bsSize?: string;
}

export class TimeSpanInputView extends BaseView<TimeSpanInputProps, TimeSpanInputViewModel> {
  public static displayName = 'TimeSpanInputView';

  static defaultProps = {
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
    const { rest, props } = this.restProps(x => {
      const { id, bsSize } = x;
      return { id, bsSize };
    });

    const isValid = this.state.isValid();
    const validationError = this.state.validationError();

    return (
      <div className='TimeSpanInput'>
        <FormGroup controlId={props.id} validationState={isValid ? null : 'error'}>
          <InputGroup>
            <BindableInput property={this.state.text}>
              <FormControl type='text' {...rest}></FormControl>
            </BindableInput>
            <InputGroup.Button>
              <DropdownButton id={`TimeSpan-units-${props.id}`} className='TimeSpan-units' key='units'
                title={this.state.unit().name} bsSize={props.bsSize}
                onSelect={this.bindEventToCommand(x => x.setUnit)}>
                {
                  Enumerable
                    .fromArray(this.state.units)
                    .select(x => <MenuItem key={x.type} eventKey={x} active={x.type === this.state.unit().type}>{x.name}</MenuItem>)
                    .toArray()
                }
              </DropdownButton>
              <Button key='up' onClick={this.bindEventToCommand(x => x.adjustValue, () => 1)}><Icon name='chevron-up'/></Button>
              <Button key='down' onClick={this.bindEventToCommand(x => x.adjustValue, () => -1)}><Icon name='chevron-down'/></Button>
            </InputGroup.Button>
          </InputGroup>
          <FormControl.Feedback />
          <HelpBlock className={({hidden: isValid})}>{ validationError }</HelpBlock>
        </FormGroup>
      </div>
    );
  }
}
