'use strict';

import * as Rx from 'rx';
import * as Ix from 'ix';
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
  key?: string;
  shortKey?: string;
}

const Units = [
  { type: UnitTypes.Ticks, name: 'Ticks' },
  { type: UnitTypes.Milliseconds, name: 'Milliseconds', key: 'millisecond', shortKey: 'ms' },
  { type: UnitTypes.Seconds, name: 'Seconds', key: 'second', shortKey: 's' },
  { type: UnitTypes.Minutes, name: 'Minutes', key: 'minute', shortKey: 'm' },
  { type: UnitTypes.Hours, name: 'Hours', key: 'hour', shortKey: 'h' },
  { type: UnitTypes.Days, name: 'Days', key: 'day', shortKey: 'd' },
  { type: UnitTypes.Weeks, name: 'Weeks', key: 'week', shortKey: 'w' },
  { type: UnitTypes.Months, name: 'Months', key: 'month', shortKey: 'M' },
  { type: UnitTypes.Quarters, name: 'Quarters', key: 'quarter', shortKey: 'Q' },
  { type: UnitTypes.Years, name: 'Years', key: 'year', shortKey: 'y' },
] as IUnit[];

interface ITimeSpanInputState {
  text: string;
  value: moment.Duration;
  unit: IUnit;
}

interface ITimeSpanInputProps {
  key?: string | number;
  value?: moment.Duration;
  placeholder?: string;
  bsSize?: string;
  minUnit?: UnitTypes;
  maxUnit?: UnitTypes;
  defaultUnit?: UnitTypes;
  units?: UnitTypes[];
  precision?: number;
  onChange?: (e: any) => void;
  groupClassName?: string;
  standalone?: boolean;
  title?: string;
}

export class TimeSpanInput extends React.Component<ITimeSpanInputProps, ITimeSpanInputState> {
  public static displayName = 'TimeSpanInput';

  static defaultProps = {
    minUnit: UnitTypes.Seconds,
    maxUnit: UnitTypes.Years,
    defaultUnit: UnitTypes.Seconds,
    precision: 2,
    standalone: false,
  };

  constructor(props?: ITimeSpanInputProps, context?: any) {
    super(props, context);

    let defaultUnit = this.props.defaultUnit < this.props.minUnit ? this.props.minUnit : this.props.defaultUnit;

    this.state = {
      text: null,
      value: this.props.value,
      unit: Units[defaultUnit],
    };

    this.units = this.props.units || this.createUnitRange(this.props.minUnit, this.props.maxUnit);
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

  private createUnitRange(minUnit: UnitTypes, maxUnit: UnitTypes) {
    let units: any = [];
    let unit = Units[minUnit];

    while (unit != null && unit.type <= maxUnit) {
      units.push(<MenuItem key={unit.type} eventKey={unit} active={unit.type === this.state.unit.type}>{unit.name}</MenuItem>);
      unit = Units[unit.type + 1];
    }

    return units;
  }

  private unitsChanged(e: any, unit: IUnit) {
    this.state.unit = unit;
    this.setState(this.state);
  }

  private adjust(delta: number) {
    if (this.state.value == null) {
      this.state.value = moment.duration(0);
    }

    this.state.value = this.state.value.add(delta, this.state.unit.shortKey);
    this.state.text = this.getDurationText();
    this.setState(this.state);

    this.onValueChanged();
  }

  private textChanged(e: any) {
    this.state.text = e.target.value;
    this.state.value = null;

    this.textInput.onNext(this.state.text);

    this.setState(this.state);
  }

  private getDurationText() {
    let value = this.state.value.as(this.state.unit.shortKey);
    let units = this.state.unit.name;

    if (value === 1) {
      units = units.replace(/s$/, '');
    }

    return `${Number(value.toFixed(this.props.precision))} ${units}`;
  }

  private parseText(text: string) {
    this.state.value = null;

    if (String.isNullOrEmpty(text) === false) {
      let args = text.split(' ', 2);

      if (Number.isNumeric(args[0])) {
        // only process if it's numeric
        if (args.length === 1) {
          // single arg
          // just assume we're using the currently selected units
          this.state.value = moment.duration(Number(args[0]), this.state.unit.shortKey);
        } else if (args.length === 2) {
          // two args
          // first determine the units used
          let unitName = moment.normalizeUnits(args[1]);

          if (String.isNullOrEmpty(unitName) === false) {
            let unit = Ix.Enumerable
              .fromArray(Units)
              .where(x => x.key === unitName)
              .firstOrDefault();

            if (unit != null) {
              // if the unit type is valid process the value
              this.state.value = moment.duration(Number(args[0]), unitName);
              // only update the currently selected units if they are parsed
              this.state.unit = unit;
            }
          }
        }
      }

      // if we updated the value then set the text and invoke a render
      if (this.state.value != null && this.state.value.asMilliseconds() > 0) {
        this.state.text = this.getDurationText();
        this.setState(this.state);

        this.onValueChanged();
      }
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
    let isInvalid = this.state.value == null || this.state.value.asMilliseconds() === 0;

    return (
      <Input groupClassName={classNames('TimeSpanInput', this.props.groupClassName)}
        type='text' bsSize={this.props.bsSize} bsStyle={isInvalid ? 'error' : null}
        title={this.props.title}
        placeholder={this.props.placeholder} value={this.state.text}
        buttonAfter={[incrementButton, decrementButton, unitDropdown]}
        onChange={(e: any) => this.textChanged(e)} standalone={this.props.standalone} />
    );
  }
}

export default TimeSpanInput;
