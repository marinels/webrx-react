import { Enumerable } from 'ix';
import * as wx from 'webrx';
import * as moment from 'moment';

import { BaseViewModel } from '../../React/BaseViewModel';

export enum TimeSpanUnitType {
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

export interface TimeSpanUnit {
  type: TimeSpanUnitType;
  name: string;
  key?: string;
  shortKey?: string;
}

export const TimeSpanUnits = [
  { type: TimeSpanUnitType.Ticks, name: 'Ticks' },
  { type: TimeSpanUnitType.Milliseconds, name: 'Milliseconds', key: 'millisecond', shortKey: 'ms' },
  { type: TimeSpanUnitType.Seconds, name: 'Seconds', key: 'second', shortKey: 's' },
  { type: TimeSpanUnitType.Minutes, name: 'Minutes', key: 'minute', shortKey: 'm' },
  { type: TimeSpanUnitType.Hours, name: 'Hours', key: 'hour', shortKey: 'h' },
  { type: TimeSpanUnitType.Days, name: 'Days', key: 'day', shortKey: 'd' },
  { type: TimeSpanUnitType.Weeks, name: 'Weeks', key: 'week', shortKey: 'w' },
  { type: TimeSpanUnitType.Months, name: 'Months', key: 'month', shortKey: 'M' },
  { type: TimeSpanUnitType.Quarters, name: 'Quarters', key: 'quarter', shortKey: 'Q' },
  { type: TimeSpanUnitType.Years, name: 'Years', key: 'year', shortKey: 'y' },
] as TimeSpanUnit[];

export class TimeSpanInputViewModel extends BaseViewModel {
  public static displayName = 'TimeSpanInputViewModel';

  public units: TimeSpanUnit[];
  public text = wx.property('');
  public unit = wx.property<TimeSpanUnit>();
  public value = wx.property<moment.Duration>();

  public validate = wx.command();

  public validationError = this.validate.results
    .select(x => ({ value: this.value(), text: this.text() }))
    .select(x => {
      let error: string;

      if (x.value == null || x.value.asMilliseconds() === 0) {
        // invalid value
        if (String.isNullOrEmpty(x.text) === true) {
          if (this.required === true) {
            error = 'This field is required';
          }
        }
        else {
          error = 'Unable to Understand Time Span Formatting';
        }
      }

      return error;
    })
    .toProperty();

  public isValid = this.validationError.changed
    .select(x => String.isNullOrEmpty(x) === true)
    .toProperty();

  public setUnit = wx.command((unit: TimeSpanUnit) => {
    this.unit(unit);
  });

  public adjustValue = wx.command((amount: number) => {
    // we have to clone the duration because moment objects are mutable
    let value = this.value() == null ? moment.duration(0) : moment.duration(this.value());
    this.setValue(value.add(amount, this.unit().key));
  });

  public parse = wx.command((text: string) => {
    this.parseText(text);
  });

  constructor(
    private initialValue?: moment.Duration,
    unit = TimeSpanUnits[TimeSpanUnitType.Seconds],
    public required = false,
    units?: TimeSpanUnitType[],
    public minValue?: moment.Duration,
    public maxValue?: moment.Duration,
    public minUnit = TimeSpanUnitType.Days,
    public maxUnit = TimeSpanUnitType.Years,
    public precision = 2,
    public parseDelay = 500
    ) {
    super();

    this.unit(unit.type < minUnit ? TimeSpanUnits[minUnit] : unit);
    this.minValue = this.minValue || moment.duration(1, this.unit().key);

    if (units == null) {
      this.units = Enumerable
        .fromArray(TimeSpanUnits)
        .where(x => x.type >= minUnit && x.type <= maxUnit)
        .toArray();
    }
    else {
      this.units = Enumerable
        .fromArray(units)
        .select(x => TimeSpanUnits[x])
        .toArray();
    }

    if (this.parseDelay > 0) {
      this.subscribe(this.text.changed
        .debounce(this.parseDelay)
        .invokeCommand(this.parse)
      );
    }

    this.subscribe(this.parse.results
      .invokeCommand(this.validate)
    );

    this.subscribe(this.value.changed
      .where(x => x != null)
      .subscribe(x => {
        let value = x.as(this.unit().key);
        let unitName = this.unit().name;
        let text = `${Number(value.toFixed(this.precision))} ${value === 1 ? unitName.replace(/s$/, '') : unitName}`;

        this.text(text);
      })
    );

    this.setValue(this.initialValue);

    this.validate.execute(null);
  }

  private setValue(value: moment.Duration) {
    if (value == null || (this.minValue == null || value >= this.minValue) && (this.maxValue == null || value <= this.maxValue)) {
      this.value(value);
    }
  }

  private parseText(text: string) {
    let value: moment.Duration = null;

    if (String.isNullOrEmpty(text) === false) {
      let args = text.split(' ', 2);

      if (Number.isNumeric(args[0])) {
        // only process if it's numeric
        if (args.length === 1) {
          // single arg
          // just assume we're using the currently selected units
          value = moment.duration(Number(args[0]), this.unit().shortKey);
        }
        else if (args.length === 2) {
          // two args
          // first determine the units used
          let unitName = moment.normalizeUnits(args[1]);

          if (String.isNullOrEmpty(unitName) === false) {
            let unit = Enumerable
              .fromArray(TimeSpanUnits)
              .where(x => x.key === unitName)
              .firstOrDefault();

            if (unit != null) {
              // if the unit type is valid process the value
              value = moment.duration(Number(args[0]), unitName);
              // only update the currently selected units if they are parsed
              this.unit(unit);
            }
          }
        }
      }
    }

    this.setValue(value);
  }
};
