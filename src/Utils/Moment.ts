'use strict';

import * as moment from 'moment';

/**
 * Conversion from .NET Ticks to millseconds
 * NOTE: this means all moment values have millisecond precision
 */
export const TicksPerMillisecond = 10000;

/**
 * Parse format for the default string serialization of a .NET DateTime
 */
export const DefaultDateTimeFormat = 'YYYY-MM-DD hh:mm:ss A';
/**
 * Parse format for the default string serialization of a .NET DateTimeOffset
 */
export const DefaultDateTimeOffsetFormat = DefaultDateTimeFormat + ' Z';

const DefaultDateTimeFormats = [DefaultDateTimeFormat, DefaultDateTimeOffsetFormat];

/**
 * Converts between .NET DateTime.Ticks and moment values
 */
export class DateTime {
  /**
   * Converts a .NET DateTime string to a moment value
   * i.e. "2016-03-09 4:32:32 PM" or "2016-03-09 4:32:32 PM -08:00" (default formats)
   */
  public static fromString(value: string, ...formats: string[]) {
    return moment.utc(value, formats.length === 0 ? DefaultDateTimeFormats : formats);
  }

  /**
   * Converts a .NET DateTime.Ticks value to a moment value (and optionally sets the UTC offset)
   * NOTE: if no offset is provided, UTC is assumed
   */
  public static fromNumber(value: number, offset?: number | string) {
    // we cast as <any> here because the moment typings don't support unioned types
    return moment(value / TicksPerMillisecond).utcOffset(<any>offset || 0);
  }

  /**
   * Converts a moment value to a DateTime.Ticks
   */
  public static toNumber(value: moment.Moment) {
    return value.valueOf() * TicksPerMillisecond;
  }
}

/**
 * Converts between .NET TimeSpan.Ticks and moment values
 */
export class TimeSpan {
  /**
   * Converts a .NET TimeSpan string to a moment duration
   * i.e. "1.05:37:46.6660000" (1.23456789 days)
   */
  public static fromString(value: string) {
    return moment.duration(value);
  }

  /**
   * Converts a .NET TimeSpan.Ticks value to a moment duration
   */
  public static fromNumber(value: number) {
    return moment.duration(value / TicksPerMillisecond);
  }

  /**
   * Converts a moment duration a .NET TimeSpan.Ticks amount
   */
  public static toNumber(value: moment.Duration) {
    return value.asMilliseconds() * TicksPerMillisecond;
  }
}
