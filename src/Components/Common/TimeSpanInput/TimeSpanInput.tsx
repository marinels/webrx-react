import * as moment from 'moment';
import * as React from 'react';
import { FormEventHandler } from 'react';
import {
  DropdownButton,
  FormControl,
  FormGroup,
  HelpBlock,
  InputGroup,
  MenuItem,
  Sizes,
} from 'react-bootstrap';
import { Icon } from 'react-fa';

import { SyntheticEvent } from 'react';
import { CommandButton } from '../CommandButton/CommandButton';

export type TimeSpanInputUnit = moment.unitOfTime.Base;

export interface TimeSpanInputProps {
  bsClass?: string;
  bsSize?: Sizes;
  controlId?: string;

  duration?: moment.Duration;
  units?: TimeSpanInputUnit[];
  initialUnit?: TimeSpanInputUnit;
  initialDuration?: moment.Duration;
  precision?: number;
  reparseButton?: boolean;

  onMomentDurationChanged?: (
    duration: moment.Duration | undefined,
    unit: TimeSpanInputUnit,
  ) => void;
  onMomentUnitChanged?: (
    unit: TimeSpanInputUnit,
    duration: moment.Duration | undefined,
  ) => void;
}

export interface TimeSpanInputComponentProps
  extends React.HTMLProps<any>,
    TimeSpanInputProps {}

export interface TimeSpanInputState {
  unit: TimeSpanInputUnit;
  input: string;
  duration?: moment.Duration;
  error?: string;
}

export class TimeSpanInput extends React.Component<
  TimeSpanInputComponentProps,
  TimeSpanInputState
> {
  public static DefaultPrecision = 2;
  public static InvalidFormatError = 'Invalid Duration Format';
  public static InvalidAmountError = 'Invalid Duration Amount';
  public static InvalidUnitError = 'Invalid Unit';

  static defaultProps: Partial<TimeSpanInputProps> = {
    units: ['seconds', 'minutes', 'hours', 'days'],
    initialUnit: 'days',
    precision: TimeSpanInput.DefaultPrecision,
  };

  public static formatDuration(
    duration: moment.Duration | undefined,
    unit: TimeSpanInputUnit,
    precision = TimeSpanInput.DefaultPrecision,
  ) {
    if (duration == null) {
      return '';
    }

    const value = duration.as(unit);
    const unitName = value === 1 ? unit.replace(/s$/, '') : unit;

    return `${Number(value.toFixed(precision))} ${unitName}`;
  }

  public static parseDuration(
    state: TimeSpanInputState,
    props: TimeSpanInputProps,
  ): TimeSpanInputState {
    if (state.input == null) {
      return state;
    }

    if (state.input === '') {
      return Object.assign({}, state, {
        duration: undefined,
      });
    }

    const match: RegExpMatchArray =
      state.input.match(/^\s*([\d\.]+)(\s+(\w+))?\s*$/) || [];
    const [_1, value, _2, unitInput] = match;

    if (Number.isNumeric(value)) {
      // only process if it's numeric and valid
      const numeric = Number(value);

      if (isNaN(numeric) || numeric < 0) {
        return Object.assign({}, state, {
          duration: undefined,
          error: TimeSpanInput.InvalidAmountError,
        });
      }

      if (String.isNullOrEmpty(unitInput)) {
        // single arg
        // just assume we're using the state units
        const duration = moment.duration(numeric, state.unit);
        const input = TimeSpanInput.formatDuration(
          duration,
          state.unit,
          props.precision,
        );

        return Object.assign({}, state, {
          input,
          duration,
          error: undefined,
        });
      } else {
        // two args
        let unit = moment.normalizeUnits(
          unitInput as TimeSpanInputUnit,
        ) as TimeSpanInputUnit;

        if (!String.isNullOrEmpty(unit)) {
          if (/s$/.test(unit) === false) {
            // pluralize the unit if it isn't already
            unit = `${unit}s` as TimeSpanInputUnit;
          }

          if (props.units!.indexOf(unit) >= 0) {
            const duration = moment.duration(numeric, unit);
            const input = TimeSpanInput.formatDuration(
              duration,
              unit,
              props.precision,
            );

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

  constructor(props: any) {
    super(props);

    this.handleReparse = this.handleReparse.bind(this);
    this.handleIncreaseDuration = this.handleIncreaseDuration.bind(this);
    this.handleDecreaseDuration = this.handleDecreaseDuration.bind(this);

    this.state = {
      unit: props.initialUnit!,
      input: TimeSpanInput.formatDuration(
        props.initialDuration,
        props.initialUnit!,
      ),
      duration: props.initialDuration,
    };
  }

  componentDidUpdate(
    prevProps: Readonly<TimeSpanInputComponentProps>,
    prevState: Readonly<TimeSpanInputState>,
    prevContext: any,
  ) {
    if (
      this.props.onMomentDurationChanged != null &&
      prevState != null &&
      this.state != null
    ) {
      if (prevState.duration != null) {
        if (
          this.state.duration == null ||
          prevState.duration !== this.state.duration
        ) {
          this.props.onMomentDurationChanged(
            this.state.duration,
            this.state.unit,
          );
        }
      } else if (this.state.duration != null) {
        if (
          prevState.duration == null ||
          prevState.duration !== this.state.duration
        ) {
          this.props.onMomentDurationChanged(
            this.state.duration,
            this.state.unit,
          );
        }
      }
    }

    if (
      this.props.onMomentUnitChanged != null &&
      prevState != null &&
      this.state != null
    ) {
      if (prevState.unit != null) {
        if (this.state.unit == null || prevState.unit !== this.state.unit) {
          this.props.onMomentUnitChanged(this.state.unit, this.state.duration);
        }
      } else if (this.state.unit != null) {
        if (prevState.unit == null || prevState.unit !== this.state.unit) {
          this.props.onMomentUnitChanged(this.state.unit, this.state.duration);
        }
      }
    }

    if (
      this.props.duration != null &&
      prevState.duration !== this.props.duration
    ) {
      this.setState((ps, p) => {
        return Object.assign({}, ps, {
          input:
            this.props.duration == null
              ? ps.input
              : TimeSpanInput.formatDuration(
                  this.props.duration,
                  ps.unit,
                  this.props.precision,
                ),
          duration: this.props.duration,
        });
      });
    }
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const {
        bsClass,
        bsSize,
        controlId,
        duration,
        units,
        initialUnit,
        initialDuration,
        precision,
        onMomentDurationChanged,
        onMomentUnitChanged,
        reparseButton,
      } = x;
      return {
        bsClass,
        bsSize,
        controlId,
        duration,
        units,
        initialUnit,
        initialDuration,
        precision,
        onMomentDurationChanged,
        onMomentUnitChanged,
        reparseButton,
      };
    });

    return (
      <FormGroup
        {...rest}
        className={this.wxr.classNames('TimeSpanInput', className)}
        bsClass={props.bsClass}
        bsSize={props.bsSize}
        controlId={props.controlId}
        validationState={
          String.isNullOrEmpty(this.state.error) ? undefined : 'error'
        }
      >
        {this.renderFormInput()}
        <FormControl.Feedback />
        {this.renderHelp()}
      </FormGroup>
    );
  }

  protected renderFormInput() {
    return (
      <InputGroup>
        {this.renderTextInput()}
        {this.renderButtons()}
      </InputGroup>
    );
  }

  protected renderTextInput() {
    if (React.Children.count(this.props.children) === 1) {
      const formControl = React.Children.only(this.props.children);

      const props = Object.assign(
        {
          value: this.state.input,
          onChange: this.handleInput.bind(this),
          onBlur: this.handleParse.bind(this),
        },
        formControl.props,
      );

      return React.cloneElement(formControl, props);
    }

    return (
      <FormControl
        type="text"
        placeholder={this.props.placeholder}
        value={this.state.input}
        onChange={this.handleInput.bind<FormEventHandler<any>>(this)}
        onBlur={this.handleParse.bind<any>(this)}
      />
    );
  }

  protected renderButtons() {
    return (
      <InputGroup.Button>
        {this.wxr.renderConditional(this.props.reparseButton, () => (
          <CommandButton
            id={`${this.props.id}-reparse`}
            className="TimeSpanInput-adjustButton"
            onClick={this.handleReparse}
            tooltip="Reparse input"
          >
            <Icon name="check" />
          </CommandButton>
        ))}
        {this.renderDropdown()}
        <CommandButton
          className="TimeSpanInput-adjustButton"
          componentClass="button"
          onClick={this.handleIncreaseDuration}
        >
          <Icon name="chevron-up" />
        </CommandButton>
        <CommandButton
          className="TimeSpanInput-adjustButton"
          componentClass="button"
          onClick={this.handleDecreaseDuration}
        >
          <Icon name="chevron-down" />
        </CommandButton>
      </InputGroup.Button>
    );
  }

  protected renderDropdown() {
    return (
      <DropdownButton
        id={`TimeSpanInput-units-${this.props.id}`}
        className="TimeSpanInput-unitDropdown"
        title={this.state.unit}
        bsSize={this.props.bsSize}
        onSelect={this.handleChangeUnit.bind<any>(this)}
      >
        {this.props.units!.map(x => (
          <MenuItem key={x} eventKey={x} active={x === this.state.unit}>
            {x}
          </MenuItem>
        ))}
      </DropdownButton>
    );
  }

  protected renderHelp() {
    return this.wxr.renderNullable(this.state.error, x => {
      return <HelpBlock>{x}</HelpBlock>;
    });
  }

  protected handleChangeUnit(unit: TimeSpanInputUnit) {
    this.setState((prevState, props) => {
      const duration = this.cloneDurationFromState(prevState);
      const input = TimeSpanInput.formatDuration(
        duration,
        unit,
        this.props.precision,
      );

      return Object.assign({ error: undefined }, prevState, {
        unit,
        input,
        duration,
      });
    });
  }

  private handleReparse() {
    // this is a fake handler to simulate a request to parse, but it really only forces a blur
  }

  protected handleIncreaseDuration() {
    this.setState((prevState, props) => {
      const duration = this.adjustDurationFromState(prevState, 1);
      const input = TimeSpanInput.formatDuration(
        duration,
        prevState.unit,
        this.props.precision,
      );

      return Object.assign({}, prevState, {
        input,
        duration,
        error:
          duration.valueOf() < 0 ? TimeSpanInput.InvalidAmountError : undefined,
      });
    });
  }

  protected handleDecreaseDuration() {
    this.setState((prevState, props) => {
      const duration = this.adjustDurationFromState(prevState, -1);
      const input = TimeSpanInput.formatDuration(
        duration,
        prevState.unit,
        this.props.precision,
      );

      return Object.assign({}, prevState, {
        input,
        duration,
        error:
          duration.valueOf() < 0 ? TimeSpanInput.InvalidAmountError : undefined,
      });
    });
  }

  protected handleInput(e: SyntheticEvent<HTMLInputElement>) {
    const input = e.currentTarget.value;

    this.setState((prevState, props) => {
      return Object.assign({}, prevState, {
        input,
      });
    });
  }

  protected handleParse() {
    this.setState((prevState, props) => {
      return Object.assign(
        {},
        prevState,
        TimeSpanInput.parseDuration(prevState, this.props),
      );
    });
  }

  protected cloneDurationFromState(state: TimeSpanInputState) {
    if (state.duration == null) {
      return moment.duration(0, state.unit);
    }

    return state.duration.clone();
  }

  protected adjustDurationFromState(state: TimeSpanInputState, amount: number) {
    return this.cloneDurationFromState(state).add(amount, state.unit);
  }
}
