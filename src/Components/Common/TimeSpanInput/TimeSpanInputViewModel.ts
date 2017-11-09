import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React';
import { Compare } from '../../../Utils';

export enum TimeSpanUnitType {
  Ticks = 0,
  Milliseconds = 1,
  Seconds = 2,
  Minutes = 3,
  Hours = 4,
  Days = 5,
  Weeks = 6,
  Months = 7,
  Years = 8,
}

export enum TimeSpanInputError {
  required = 1,
  format = 2,
}

export interface TimeSpanUnit {
  type: TimeSpanUnitType;
  name: string;
  key?: moment.unitOfTime.Base;
  shortKey?: moment.unitOfTime.Base;
}

export interface TimeSpanParseResult {
  duration: moment.Duration;
  unit?: TimeSpanUnit;
}

function createTimeSpanUnits() {
  const units: { [ type: number ]: TimeSpanUnit } = {
  };

  units[TimeSpanUnitType.Ticks]         = { type: TimeSpanUnitType.Ticks, name: 'Ticks' };
  units[TimeSpanUnitType.Milliseconds]  = { type: TimeSpanUnitType.Milliseconds, name: 'Milliseconds', key: 'millisecond', shortKey: 'ms' };
  units[TimeSpanUnitType.Seconds]       = { type: TimeSpanUnitType.Seconds, name: 'Seconds', key: 'second', shortKey: 's' };
  units[TimeSpanUnitType.Minutes]       = { type: TimeSpanUnitType.Minutes, name: 'Minutes', key: 'minute', shortKey: 'm' };
  units[TimeSpanUnitType.Hours]         = { type: TimeSpanUnitType.Hours, name: 'Hours', key: 'hour', shortKey: 'h' };
  units[TimeSpanUnitType.Days]          = { type: TimeSpanUnitType.Days, name: 'Days', key: 'day', shortKey: 'd' };
  units[TimeSpanUnitType.Weeks]         = { type: TimeSpanUnitType.Weeks, name: 'Weeks', key: 'week', shortKey: 'w' };
  units[TimeSpanUnitType.Months]        = { type: TimeSpanUnitType.Months, name: 'Months', key: 'month', shortKey: 'M' };
  units[TimeSpanUnitType.Years]         = { type: TimeSpanUnitType.Years, name: 'Years', key: 'year', shortKey: 'y' };

  return units;
}

export const TimeSpanUnits = createTimeSpanUnits();

export const DefaultPrecision = 2;
export const DefaultParseDelay = 1000;

export class TimeSpanInputViewModel extends BaseViewModel {
  public static displayName = 'TimeSpanInputViewModel';

  public static parse(
    text: string,
    unit: TimeSpanUnit,
    units: Array<TimeSpanUnit>,
  ): TimeSpanParseResult | undefined {
    if (String.isNullOrEmpty(text) === false) {
      // we don't need the other placeholder matches
      // tslint:disable-next-line:no-unused-variable
      let [ _1, value, _2, unitName ] = (text.match(/\s*([\d\.]+)(\s+(\w+))?\s*$/) || <RegExpMatchArray>[]);

      if (Number.isNumeric(value)) {
        // only process if it's numeric
        if (String.isNullOrEmpty(unitName)) {
          // single arg
          // just assume we're using the provided units
          return {
            duration: moment.duration(Number(value), unit.shortKey),
          };
        }
        else {
          // two args
          // first determine the units used
          const unitOfTime = <moment.unitOfTime.Base>moment.normalizeUnits(<moment.unitOfTime.Base>unitName);
          // also try lowercase (i.e. 'D' normalizes literally to 'date', but may have been intended as 'Day')
          const unitOfTimeLower = <moment.unitOfTime.Base>moment.normalizeUnits(<moment.unitOfTime.Base>unitName.toLowerCase());

          if (!String.isNullOrEmpty(unitOfTime)) {
            const parsedUnit = units
              .asIterable()
              .single(x => x.key === unitOfTime || x.key === unitOfTimeLower);

            if (parsedUnit != null) {
              // if the unit type is valid process the value
              return {
                duration: moment.duration(Number(value), parsedUnit.key),
                unit: parsedUnit,
              };
            }
          }
        }
      }
    }

    return undefined;
  }

  public static format(
    duration: moment.Duration | undefined,
    unit: TimeSpanUnit | undefined,
    precision: number,
  ): string {
    if (duration == null || unit == null || unit.key == null) {
      return '';
    }

    const value = duration.as(unit.key);
    const unitName = value === 1 ?
      unit.name.replace(/s$/, '') :
      unit.name;

    return `${ Number(value.toFixed(precision)) } ${ unitName }`;
  }

  public readonly units: Array<TimeSpanUnit>;
  public readonly text: Property<string>;
  public readonly unit: ReadOnlyProperty<TimeSpanUnit>;
  public readonly duration: ReadOnlyProperty<moment.Duration | undefined>;
  public readonly error: ReadOnlyProperty<TimeSpanInputError | undefined>;

  public readonly setUnit: Command<TimeSpanUnit>;
  public readonly setDuration: Command<moment.Duration>;
  public readonly setText: Command<string>;
  public readonly adjust: Command<number>;

  constructor(
    required = false,
    minUnit = TimeSpanUnitType.Days,
    maxUnit = TimeSpanUnitType.Years,
    initialValue?: moment.Duration,
    initialUnit = TimeSpanUnitType.Seconds,
    units?: Array<TimeSpanUnitType>,
    minValue?: moment.Duration,
    maxValue?: moment.Duration,
    precision = DefaultPrecision,
    parseDelay = DefaultParseDelay,
  ) {
    super();

    this.units = (units || Object.getEnumValues<TimeSpanUnitType>(TimeSpanUnitType))
      .filter(x => x >= minUnit && x <= maxUnit)
      .map(x => TimeSpanUnits[x]);

    this.setUnit = this.wx.command<TimeSpanUnit>();
    this.setDuration = this.wx.command<moment.Duration>();
    this.setText = this.wx.command<string>();
    this.adjust = this.wx.command<number>();

    this.unit = this.wx
      .whenAny(this.setUnit.results, x => x)
      .toProperty(TimeSpanUnits[(initialUnit < minUnit || initialUnit > maxUnit) ? minUnit : initialUnit]);

    this.text = this.wx.property(TimeSpanInputViewModel.format(initialValue, this.unit.value, precision));

    this.duration = this.wx
      .whenAny(this.setDuration, x => x)
      .toProperty();

    this.error = this.wx
      .whenAny(
        this.duration,
        this.text,
        (duration, text) => ({ duration, text }),
      )
      .map(x => {
        if (x.duration == null && String.isNullOrEmpty(x.text) === false) {
          return TimeSpanInputError.format;
        }

        if (required && x.duration == null) {
          return TimeSpanInputError.required;
        }

        return undefined;
      })
      .toProperty();

    // produce observable of changes from parsing text
    const parsedResults = this.wx
      .whenAny(this.text, x => x)
      .skip(1)
      .debounceTime(parseDelay)
      .withLatestFrom(
        this.wx
          .whenAny(this.unit, x => x),
        (text, unit) => ({ text, unit }),
      )
      .map(x => {
        const result = TimeSpanInputViewModel.parse(x.text, x.unit, this.units);

        if (result == null) {
          return {
            duration: <moment.Duration | undefined>undefined,
            unit: x.unit,
          };
        }

        if (minValue != null && result.duration < minValue) {
          result.duration = minValue;
        }
        else if (maxValue != null && result.duration > maxValue) {
          result.duration = maxValue;
        }

        return {
          duration: result.duration,
          unit: result.unit || x.unit,
        };
      });

    // produce observable of changes from units being adjusted
    const unitResults = this.setUnit.results
      .withLatestFrom(
        this.wx
          .whenAny(this.duration, x => x)
          .filterNull(),
        (unit, duration) => ({ duration, unit }),
      );

    // produce observable of changes from adjustment command being invoked
    const adjustmentResults = this.adjust.results
      .withLatestFrom(
        this.wx
          .whenAny(this.duration, x => x),
        this.wx
          .whenAny(this.unit, x => x),
        (amount, duration, unit) => ({ amount, duration, unit }),
      )
      .map(x => ({
        duration: (x.duration == null ? moment.duration(0, x.unit.key) : x.duration.clone()).add(x.amount, x.unit.key),
        unit: x.unit,
      }));

    // merge all changes into a single shared observable
    const durationChanges = Observable
      .merge(
        parsedResults,
        unitResults,
        adjustmentResults,
      )
      .share();

    // when any duration value changes invoke the setDuration command
    this.addSubscription(
      durationChanges
        .map(x => x.duration)
        .distinctUntilChanged(Compare.compare)
        .invokeCommand(this.setDuration),
    );

    // when any unit value changes invoke the setUnit command
    this.addSubscription(
      durationChanges
        .map(x => x.unit)
        .distinctUntilChanged()
        .invokeCommand(this.setUnit),
    );

    // any time we have a new change, format it to a string and invoke setText
    // this will attempt to update the text property and queue a re-render
    // NOTE: we never clear out the text field (on parse or format error)
    this.addSubscription(
      durationChanges
        .map(x => TimeSpanInputViewModel.format(x.duration, x.unit, precision))
        .filter(x => String.isNullOrEmpty(x) === false)
        .invokeCommand(this.setText),
    );

    // any time setText is invoked pass through the value into the text property
    this.addSubscription(
      this.setText.results
        .subscribe(x => {
          this.text.value = x;
        }),
    );
  }
}
