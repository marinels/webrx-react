'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';
import * as React from 'react';
import * as moment from 'moment';
import * as Icon from 'react-fa';
import * as classNames from 'classnames';

import { Input, Button, DropdownButton, MenuItem } from 'react-bootstrap';

export enum UnitTypes {
  Ticks = 0,
  Milliseconds = 1,
  Seconds = 2,
  Minutes = 3,
  Hours = 4,
  Days = 5,
  Weeks = 6,
  Months = 7,
  Quarters = 8,
  Years = 9
}

interface IUnit {
  type: UnitTypes;
  name: string;
  shortName?: string;
}

const Units = [
  { type: UnitTypes.Ticks, name: 'Ticks' },
  { type: UnitTypes.Milliseconds, name: 'Milliseconds', shortName: 'ms' },
  { type: UnitTypes.Seconds, name: 'Seconds', shortName: 's' },
  { type: UnitTypes.Minutes, name: 'Minutes', shortName: 'm' },
  { type: UnitTypes.Hours, name: 'Hours', shortName: 'h' },
  { type: UnitTypes.Days, name: 'Days', shortName: 'd' },
  { type: UnitTypes.Weeks, name: 'Weeks', shortName: 'w' },
  { type: UnitTypes.Months, name: 'Months', shortName: 'M' },
  { type: UnitTypes.Quarters, name: 'Quarters', shortName: 'Q' },
  { type: UnitTypes.Years, name: 'Years', shortName: 'y' },
] as IUnit[];

interface ITimeSpanInputState {
  text: string;
  value: moment.Moment;
  unit: IUnit;
}

interface ITimeSpanInputProps {
  key?: string | number;
  value?: moment.Moment;
  placeholder?: string;
  bsSize?: string;
  minUnit?: UnitTypes;
  maxUnit?: UnitTypes;
  defaultUnit?: UnitTypes;
  units?: UnitTypes[];
  format?: string;
  onChange?: (e: any) => void;
  groupClassName?: string;
  standalone?: boolean;
  title?: string;
}

export class TimeSpanInput extends React.Component<ITimeSpanInputProps, ITimeSpanInputState> {
  public static displayName = 'TimeSpanInput';

  static defaultProps = {
    minUnit: UnitTypes.Seconds,
    defaultUnit: UnitTypes.Seconds,
    format: 'LLLL',
    standalone: false
  };

  constructor(props?: ITimeSpanInputProps, context?: any) {
    super(props, context);

    let unit = Units[this.props.defaultUnit < this.props.minUnit ? this.props.minUnit : this.props.defaultUnit];
    this.units = this.props.units || this.createUnitRange(unit);

    this.state = {
      text: null,
      value: this.props.value || moment(),
      unit
    };
  }

  private units: IUnit[];
  private textInput = new Rx.Subject<string>();
  private textInputHandle: Rx.IDisposable;

  componentDidMount() {
    this.textInputHandle = this.textInput
      .debounce(500)
      .where(x => String.isNullOrEmpty(x) === false)
      .subscribe(x => {
        this.parseText(x);
      });
  }

  componentWillUnmount() {
    this.textInputHandle = Object.dispose(this.textInputHandle);
  }

  private createUnitRange(unit: IUnit) {
    let units: any = [];

    while (unit != null && unit.type <= (this.props.maxUnit || UnitTypes.Years)) {
      units.push(<MenuItem key={unit.type} eventKey={unit} active={unit.type === this.props.defaultUnit}>{unit.name}</MenuItem>);
      unit = Units[unit.type + 1];
    }

    return units;
  }

  private unitsChanged(e: any, unit: IUnit) {
    this.state.unit = unit;
    this.setState(this.state);
  }

  private adjust(delta: number) {
    this.state.value = this.state.value.add(delta, this.state.unit.shortName);
    this.state.text = this.state.value.fromNow();
    this.setState(this.state);

    this.onValueChanged();
  }

  private textChanged(e: any) {
    this.state.text = e.target.value;
    this.state.value = null;

    this.textInput.onNext(this.state.text);

    this.setState(this.state);
  }

  private parseText(text: string) {
    let args = text.split(' ', 2);

    if (args.length === 1 && args[0].length >= 6) {
      let value = moment(text);
      if (value.isValid() === true) {
        this.state.value = value;
      }
    } else if (args.length === 2 && args[1].length > 0) {
      let duration = moment.duration(Number(args[0]), args[1]);

      if (duration.asMilliseconds() > 0) {
        this.state.value = moment().add(duration);
      }
    }

    if (this.state.value != null) {
      this.state.text = this.state.value.fromNow();
      this.setState(this.state);

      this.onValueChanged();
    }
  }

  private onValueChanged() {
    if (this.props.onChange != null) {
      this.props.onChange({ target: { value: this.state.value } });
    }
  }

  render() {
    let unit = Units[this.props.minUnit];

    let unitDropdown = (
      <DropdownButton key='units' title={this.state.unit.name} id='TimeSpan-units' bsSize={this.props.bsSize}
        onSelect={(e: any, unit: IUnit) => this.unitsChanged(e, unit)}>
        {this.units}
      </DropdownButton>
    );
    let incrementButton = <Button key='up' onClick={() => this.adjust(1)}><Icon name='chevron-up'/></Button>;
    let decrementButton = <Button key='down' onClick={() => this.adjust(-1)}><Icon name='chevron-down'/></Button>;
    let isInvalid = this.state.value == null || this.state.value.isValid() !== true;

    return (
      <Input groupClassName={classNames('TimeSpanInput', this.props.groupClassName)}
        type='text' bsSize={this.props.bsSize} bsStyle={isInvalid ? 'error' : null}
        title={this.props.title || (this.state.value == null ? 'Invalid Format' : this.state.value.format(this.props.format))}
        placeholder={this.props.placeholder} value={this.state.text}
        buttonAfter={[incrementButton, decrementButton, unitDropdown]}
        onChange={(e: any) => this.textChanged(e)} standalone={this.props.standalone} />
    );
  }
}

export default TimeSpanInput;
