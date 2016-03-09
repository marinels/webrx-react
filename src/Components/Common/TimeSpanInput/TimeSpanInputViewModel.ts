'use strict';

import * as Rx from 'rx';
import * as Ix from 'ix';
import * as wx from 'webrx';
import * as moment from 'moment';

import BaseViewModel from '../../React/BaseViewModel';

export enum UnitType {
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

export interface IUnit {
  type: UnitType;
  name: string;
  key?: string;
  shortKey?: string;
}

export const Units = [
  { type: UnitType.Ticks, name: 'Ticks' },
  { type: UnitType.Milliseconds, name: 'Milliseconds', key: 'millisecond', shortKey: 'ms' },
  { type: UnitType.Seconds, name: 'Seconds', key: 'second', shortKey: 's' },
  { type: UnitType.Minutes, name: 'Minutes', key: 'minute', shortKey: 'm' },
  { type: UnitType.Hours, name: 'Hours', key: 'hour', shortKey: 'h' },
  { type: UnitType.Days, name: 'Days', key: 'day', shortKey: 'd' },
  { type: UnitType.Weeks, name: 'Weeks', key: 'week', shortKey: 'w' },
  { type: UnitType.Months, name: 'Months', key: 'month', shortKey: 'M' },
  { type: UnitType.Quarters, name: 'Quarters', key: 'quarter', shortKey: 'Q' },
  { type: UnitType.Years, name: 'Years', key: 'year', shortKey: 'y' },
] as IUnit[];

export class TimeSpanInputViewModel extends BaseViewModel {
  public static displayName = 'TimeSpanInputViewModel';

  constructor(
    private initialValue?: moment.Duration,
    unit = Units[UnitType.Seconds],
    units?: UnitType[],
    public minValue?: moment.Duration,
    public maxValue?: moment.Duration,
    public minUnit = UnitType.Days,
    public maxUnit = UnitType.Years,
    public precision = 2,
    public parseDelay = 500
    ) {
    super();

    this.unit(unit.type < minUnit ? Units[minUnit] : unit);
    this.minValue = this.minValue || moment.duration(1, this.unit().key);

    if (units == null) {
      this.units = Ix.Enumerable
        .fromArray(Units)
        .where(x => x.type >= minUnit && x.type <= maxUnit)
        .toArray();
    } else {
      this.units = Ix.Enumerable
        .fromArray(units)
        .select(x => Units[x])
        .toArray();
    }
  }

  public units: IUnit[];
  public text = wx.property('');
  public unit = wx.property<IUnit>();
  public value = wx.property<moment.Duration>();

  public setUnit = wx.command((unit: IUnit) => {
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

  initialize() {
    super.initialize();

    if (this.parseDelay > 0) {
      this.subscribe(this.text.changed
        .debounce(this.parseDelay)
        .where(x => String.isNullOrEmpty(x) === false)
        .invokeCommand(this.parse)
      );
    }

    this.subscribe(this.value.changed
      .where(x => x != null)
      .subscribe(x => {
        let value = x.as(this.unit().key);
        let units = this.unit().name;
        let text = `${Number(value.toFixed(this.precision))} ${value === 1 ? units.replace(/s$/, '') : units}`;

        this.text(text);
      })
    );

    this.setValue(this.initialValue);
  }

  private setValue(value: moment.Duration) {
    if ((this.minValue == null || value >= this.minValue) && (this.maxValue == null || value <= this.maxValue)) {
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

export default TimeSpanInputViewModel;
