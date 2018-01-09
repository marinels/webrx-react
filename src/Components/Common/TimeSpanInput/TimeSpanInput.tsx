import * as React from 'react';
import { FormGroup, InputGroup, Sizes, FormControl, FormControlProps, DropdownButton, MenuItem, HelpBlock } from 'react-bootstrap';
import { Icon } from 'react-fa';
import * as moment from 'moment';

import { BindableInput, BindableInputProps } from '../BindableInput/BindableInput';
import { CommandButton } from '../CommandButton/CommandButton';
import { SyntheticEvent } from 'react';

export type TimeSpanInputUnit = moment.unitOfTime.Base;

export interface TimeSpanInputProps {
  bsClass?: string;
  bsSize?: Sizes;
  controlId?: string;

  units?: Array<TimeSpanInputUnit>;
  initialUnit?: TimeSpanInputUnit;
  initialDuration?: moment.Duration;
  precision?: number;

  onDurationChanged?: (duration: moment.Moment) => void;
}

export interface TimeSpanInputComponentProps extends React.HTMLProps<any>, TimeSpanInputProps {
}

export interface TimeSpanInputState {
  unit: TimeSpanInputUnit;
  input: string;
  duration?: moment.Duration;
  error?: string;
}

export class TimeSpanInput extends React.Component<TimeSpanInputComponentProps, TimeSpanInputState> {
  public static DefaultPrecision = 2;
  public static InvalidFormatError = 'Invalid Duration Format';
  public static InvalidUnitError = 'Invalid Unit';

  static defaultProps: Partial<TimeSpanInputProps> = {
    units: [ 'seconds', 'minutes', 'hours', 'days' ],
    initialUnit: 'days',
    precision: TimeSpanInput.DefaultPrecision,
  };

  public static formatDuration(duration: moment.Duration | undefined, unit: TimeSpanInputUnit, precision = TimeSpanInput.DefaultPrecision) {
    if (duration == null) {
      return '';
    }

    const value = duration.as(unit);
    const unitName = value === 1 ?
      unit.replace(/s$/, '') :
      unit;

    return `${ Number(value.toFixed(precision)) } ${ unitName }`;
  }

  public static parseDuration(state: TimeSpanInputState, props: TimeSpanInputProps): TimeSpanInputState {
    if (String.isNullOrEmpty(state.input)) {
      return state;
    }

    const match: RegExpMatchArray = state.input.match(/\s*([\d\.]+)(\s+(\w+))?\s*$/) || [];
    let [ _1, value, _2, unitInput ] = match;

    if (Number.isNumeric(value)) {
      // only process if it's numeric
      if (String.isNullOrEmpty(unitInput)) {
        // single arg
        // just assume we're using the state units
        const duration = moment.duration(Number(value), state.unit);
        const input = TimeSpanInput.formatDuration(duration, state.unit, props.precision);

        return Object.assign({}, state, {
          input,
          duration,
          error: undefined,
        });
      }
      else {
        // two args
        let unit = moment.normalizeUnits(unitInput as TimeSpanInputUnit) as TimeSpanInputUnit;

        if (!String.isNullOrEmpty(unit)) {
          if (/s$/.test(unit) === false) {
            // pluralize the unit if it isn't already
            unit = `${ unit }s` as TimeSpanInputUnit;
          }

          if (props.units!.indexOf(unit) >= 0) {
            const duration = moment.duration(Number(value), unit);
            const input = TimeSpanInput.formatDuration(duration, unit, props.precision);

            return Object.assign({}, state, {
              unit,
              input,
              duration,
              error: undefined,
            });
          }
        }

        return Object.assign({}, state, {
          duration: undefined,
          error: TimeSpanInput.InvalidUnitError,
        });
      }
    }

    return Object.assign({}, state, {
      duration: undefined,
      error: TimeSpanInput.InvalidFormatError,
    });
  }

  constructor(props: TimeSpanInputComponentProps, context?: any) {
    super(props, context);

    this.state = {
      unit: props.initialUnit!,
      input: TimeSpanInput.formatDuration(props.initialDuration, props.initialUnit!),
      duration: props.initialDuration,
    };
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { bsClass, bsSize, controlId, units, initialUnit, initialDuration, precision, onDurationChanged } = x;
      return { bsClass, bsSize, controlId, units, initialUnit, initialDuration, precision, onDurationChanged };
    });

    return (
      <FormGroup { ...rest }
        className={ this.wxr.classNames('TimeSpanInput', className) }
        bsClass={ props.bsClass } bsSize={ props.bsSize } controlId={ props.controlId }
        validationState={ String.isNullOrEmpty(this.state.error) ? undefined : 'error' }
      >
        { this.renderButtons() }
        <FormControl.Feedback />
        { this.renderHelp() }
      </FormGroup>
    );
  }

  protected renderInput() {
    if (React.Children.count(this.props.children) > 0) {
      return this.props.children;
    }

    return (
      <FormControl type='text' placeholder={ this.props.placeholder }
        value={ this.state.input }
        onChange={ this.handleInput.bind(this) }
        onBlur={ this.handleParse.bind(this) }
      />
    );
  }

  protected renderButtons() {
    return (
      <InputGroup>
        { this.renderInput() }
        <InputGroup.Button>
          {
            // this is a fake button to simulate a request to parse, but it really only forces blur
          }
          <CommandButton className='TimeSpanInput-adjustButton' onClick={ () => { return; } }>
            <Icon name='refresh'/>
          </CommandButton>
          { this.renderDropdown() }
          <CommandButton className='TimeSpanInput-adjustButton' componentClass='button' onClick={ this.handleIncreaseDuration.bind(this) }>
            <Icon name='chevron-up'/>
          </CommandButton>
          <CommandButton className='TimeSpanInput-adjustButton' componentClass='button' onClick={ this.handleDecreaseDuration.bind(this) }>
            <Icon name='chevron-down'/>
          </CommandButton>
        </InputGroup.Button>
      </InputGroup>
    );
  }

  protected renderDropdown() {
    return (
      <DropdownButton id={ `TimeSpanInput-units-${ this.props.id }` }
        className='TimeSpanInput-unitDropdown'
        title={ this.state.unit } bsSize={ this.props.bsSize }
        onSelect={ this.handleChangeUnit.bind(this) }
      >
        {
          this.props.units!
            .map(x => (
              <MenuItem key={ x } eventKey={ x } active={ x === this.state.unit }>
                { x }
              </MenuItem>
            ))
        }
      </DropdownButton>
    );
  }

  protected renderHelp() {
    return this.wxr
      .renderNullable(
        this.state.error,
        x => {
          return (
            <HelpBlock>{ x }</HelpBlock>
          );
        },
      );
  }

  protected handleChangeUnit(unit: TimeSpanInputUnit) {
    this.setState((prevState, props) => {
      const duration = this.cloneDurationFromState(prevState);
      const input = TimeSpanInput.formatDuration(duration, unit, this.props.precision);

      return Object.assign({ error: undefined }, prevState, {
        unit,
        input,
        duration,
      });
    });
  }

  protected handleIncreaseDuration() {
    this.setState((prevState, props) => {
      const duration = this.adjustDurationFromState(prevState, 1);
      const input = TimeSpanInput.formatDuration(duration, prevState.unit, this.props.precision);

      return Object.assign({}, prevState, {
        input,
        duration,
        error: undefined,
      });
    });
  }

  protected handleDecreaseDuration() {
    this.setState((prevState, props) => {
      const duration = this.adjustDurationFromState(prevState, -1);
      const input = TimeSpanInput.formatDuration(duration, prevState.unit, this.props.precision);

      return Object.assign({}, prevState, {
        input,
        duration,
        error: undefined,
      });
    });
  }

  protected handleInput(e: SyntheticEvent<HTMLInputElement>) {
    const input = e.currentTarget.value;

    this.setState((prevState, props) => {
      return Object.assign({}, prevState, {
        input,
        error: undefined,
      });
    });
  }

  protected handleParse() {
    this.setState((prevState, props) => {
      return Object.assign({}, prevState, TimeSpanInput.parseDuration(prevState, this.props));
    });
  }

  protected cloneDurationFromState(state: TimeSpanInputState) {
    if (state.duration == null) {
      return moment.duration(0, state.unit);
    }

    return state.duration.clone();
  }

  protected adjustDurationFromState(state: TimeSpanInputState, amount: number) {
    return this.cloneDurationFromState(state)
      .add(amount, state.unit);
  }
}
