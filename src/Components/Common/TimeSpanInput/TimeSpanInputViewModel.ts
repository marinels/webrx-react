import { Observable } from 'rx';
import * as moment from 'moment';

import { wx } from '../../../WebRx';
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
  Years = 8,
}

export interface TimeSpanUnit {
  type: TimeSpanUnitType;
  name: string;
  key?: moment.unitOfTime.Base;
  shortKey?: moment.unitOfTime.Base;
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

  public units: TimeSpanUnit[];
  public text: wx.IObservableProperty<string>;
  public unit: wx.IObservableReadOnlyProperty<TimeSpanUnit>;
  public duration: wx.IObservableReadOnlyProperty<moment.Duration | undefined>;
  public isValid: wx.IObservableReadOnlyProperty<boolean>;
  public hasError: wx.IObservableReadOnlyProperty<boolean>;

  public adjust: wx.ICommand<number>;
  public setUnit: wx.ICommand<TimeSpanUnit>;

  constructor(
    required = false,
    minUnit = TimeSpanUnitType.Days,
    maxUnit = TimeSpanUnitType.Years,
    initialValue?: moment.Duration,
    initialUnit = TimeSpanUnitType.Seconds,
    units?: TimeSpanUnitType[],
    minValue?: moment.Duration,
    maxValue?: moment.Duration,
    precision = DefaultPrecision,
    parseDelay = DefaultParseDelay,
  ) {
    super();

    this.units = (units || Object.getEnumValues<TimeSpanUnitType>(TimeSpanUnitType))
      .filter(x => x >= minUnit && x <= maxUnit)
      .map(x => TimeSpanUnits[x]);

    this.adjust = wx.asyncCommand((x: number) => Observable.of(x));
    this.setUnit = wx.asyncCommand((x: TimeSpanUnit) => Observable.of(x));

    this.unit = wx
      .whenAny(this.setUnit.results, x => x)
      .toProperty(TimeSpanUnits[(initialUnit < minUnit || initialUnit > maxUnit) ? minUnit : initialUnit]);

    this.text = wx.property(this.getText(initialValue, this.unit(), precision));

    this.duration = wx
      .whenAny(this.text, this.unit, (text, unit) => ({ text, unit }))
      .where(x => x.unit != null)
      .debounce(parseDelay)
      .map(x => ({ duration: this.parse(x.text, x.unit), unit: x.unit }))
      .doOnNext(x => {
        // if we have a valid duration then check to see if we need to update the text
        if (x != null) {
          const text = this.getText(x.duration, x.unit, precision);

          // if we have new text update and queue a re-rendering
          if (text.localeCompare(this.text()) !== 0) {
            this.text(text);

            this.notifyChanged();
          }
        }
      })
      .map(x => x.duration)
      .toProperty();

    this.isValid = wx
      .whenAny(this.duration, x => x != null)
      .toProperty();

    this.hasError = wx
      .whenAny(this.isValid, this.text, (isValid, text) => this.validate(isValid, text, required))
      .toProperty();
  }

  private getText(duration: moment.Duration | undefined, unit: TimeSpanUnit | undefined, precision: number) {
    let text = '';

    const key = unit == null ? undefined : unit.key;

    if (duration != null && key != null) {
      const value = duration.as(key);
      let unitName = this.unit().name;

      if (value === 1) {
        // trim the trailing 's' from the unit name
        unitName = unitName.replace(/s$/, '');
      }

      text = `${ Number(value.toFixed(precision)) } ${ unitName }`;
    }

    return text;
  }

  private validate(isValid: boolean, text: string, required: boolean) {
    if (required === true) {
      return isValid === false;
    }
    else {
      return String.isNullOrEmpty(text) === false && (isValid === false);
    }
  }

  private parse(text: string, unit: TimeSpanUnit) {
    let duration: moment.Duration | undefined;

    if (String.isNullOrEmpty(text) === false) {
      // we don't need the other placeholder matches
      // tslint:disable-next-line:no-unused-variable
      let [ _1, value, _2, unitName ] = (text.match(/\s*([\d\.]+)(\s+(\w+))?\s*$/) || <RegExpMatchArray>[]);

      const unitOfTime = <moment.unitOfTime.Base>unitName;

      if (Number.isNumeric(value)) {
        // only process if it's numeric
        if (String.isNullOrEmpty(unitOfTime) === true) {
          // single arg
          // just assume we're using the currently selected units
          duration = moment.duration(Number(value), unit.shortKey);
        }
        else {
          // two args
          // first determine the units used
          unitName = moment.normalizeUnits(unitOfTime);

          if (String.isNullOrEmpty(unitName) === false) {
            const parsedUnit = this.units
              .filter(x => x.key != null && x.key.localeCompare(unitName) === 0)
              .asEnumerable()
              .singleOrDefault();

            if (parsedUnit != null) {
              // if the unit type is valid process the value
              duration = moment.duration(Number(value), unitOfTime);

              // only update the currently selected units if they are parsed
              this.setUnit.execute(parsedUnit);
            }
          }
        }
      }
    }

    return duration;
  }
};
