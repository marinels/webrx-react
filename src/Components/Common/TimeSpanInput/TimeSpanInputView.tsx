'use strict';

import * as Ix from 'ix';
import * as React from 'react';
import { Input, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';

import { TimeSpanInputViewModel } from './TimeSpanInputViewModel';

interface ITimeSpanInputProps extends IBaseViewProps {
  id: string;
  placeholder?: string;
  title?: string;
  standalone?: boolean;
  bsSize?: string;
  groupClassName?: string;
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
    ];
  }

  render() {
    let units = Ix.Enumerable
      .fromArray(this.state.units)
      .select(x => <MenuItem key={x.type} eventKey={x} active={x.type === this.state.unit().type}>{x.name}</MenuItem>)
      .toArray();

    let unitDropdown = (
      <DropdownButton id={`TimeSpan-units-${this.props.id}`} className='TimeSpan-units' key='units'
        title={this.state.unit().name} bsSize={this.props.bsSize}
        onSelect={this.bindEvent(x => x.setUnit, (e, args) => args[0])}>
        { units }
      </DropdownButton>
    );
    let incrementButton = <Button key='up' onClick={this.bindEvent(x => x.adjustValue, () => 1)}><Icon name='chevron-up'/></Button>;
    let decrementButton = <Button key='down' onClick={this.bindEvent(x => x.adjustValue, () => -1)}><Icon name='chevron-down'/></Button>;

    return (
      <div className='TimeSpanInput'>
        <BindableInput property={this.state.text}>
          <Input groupClassName={this.props.groupClassName}
            type='text' bsSize={this.props.bsSize} bsStyle={this.state.isValid() ? null : 'error'}
            title={this.props.title}
            placeholder={this.props.placeholder}
            buttonAfter={[incrementButton, decrementButton, unitDropdown]}
            standalone={this.props.standalone}
            onBlur={this.state.parseDelay === 0 ? this.bindEvent(x => x.parse) : null} />
        </BindableInput>
      </div>
    );
  }
}

export default TimeSpanInputView;
