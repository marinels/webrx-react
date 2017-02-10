import * as moment from 'moment';

/**
 * Conversion from .NET Ticks to millseconds
 * NOTE: this means all moment values have millisecond precision
 */
export const TicksPerMillisecond = 10000;

/**
 * Offset from .NET milliseconds to unix milliseconds
 */
export const EpochOffset = 62135596800000;

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
    return String.isNullOrEmpty(value) ? null : moment.utc(value, formats.length === 0 ? DefaultDateTimeFormats : formats);
  }

  /**
   * Converts a .NET DateTime.Ticks value to a moment value (and optionally sets the UTC offset)
   * NOTE: if no offset is provided, UTC is assumed
   */
  public static fromNumber(value: number, offset?: number | string) {
    const result = value == null ? null : moment(value / TicksPerMillisecond - EpochOffset);

    return offset == null ? result.local() : result.utcOffset(offset);
  }

  /**
   * Converts a moment value to a DateTime.Ticks
   */
  public static toNumber(value: moment.Moment) {
    return (value != null && value.isValid()) ? (value.valueOf() + EpochOffset) * TicksPerMillisecond : null;
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
    return String.isNullOrEmpty(value) ? null : moment.duration(value);
  }

  /**
   * Converts a .NET TimeSpan.Ticks value to a moment duration
   */
  public static fromNumber(value: number) {
    return value == null ? null : moment.duration(value / TicksPerMillisecond);
  }

  /**
   * Converts a moment duration a .NET TimeSpan.Ticks amount
   */
  public static toNumber(value: moment.Duration) {
    return value == null ? null : value.asMilliseconds() * TicksPerMillisecond;
  }
}
