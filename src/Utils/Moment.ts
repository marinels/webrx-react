import * as moment from 'moment';

/**
 * Conversion from .NET Ticks to millseconds
 * NOTE: this means all moment values have millisecond precision
 */
export const TicksPerMillisecond = 10000;

// some helper constants to interact with milliseconds
export const MillisecondsPerDay = 86400000;
export const MillisecondsPerYear = 31536000000;

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
  static fromString(value: string, ...formats: string[]): moment.Moment;
  static fromString(value: string | undefined, ...formats: string[]): moment.Moment | undefined;
  public static fromString(value: string | undefined, ...formats: string[]) {
    return String.isNullOrEmpty(value) ? undefined : moment.utc(value, formats.length === 0 ? DefaultDateTimeFormats : formats);
  }

  /**
   * Converts a .NET DateTime.Ticks value to a moment value (and optionally sets the UTC offset)
   * NOTE: if no offset is provided, UTC is assumed
   */
  static fromNumber(value: number, offset?: number | string): moment.Moment;
  static fromNumber(value: number | undefined, offset?: number | string): moment.Moment | undefined;
  public static fromNumber(value: number | undefined, offset?: number | string) {
    if (value == null) {
      return undefined;
    }

    const result = moment(value / TicksPerMillisecond - EpochOffset);

    return offset == null ? result.local() : result.utcOffset(offset);
  }

  /**
   * Converts a moment value to a DateTime.Ticks
   */
  static toNumber(value: moment.Moment): number;
  static toNumber(value: moment.Moment | undefined): number | undefined;
  public static toNumber(value: moment.Moment | undefined) {
    return (value != null && value.isValid()) ? (value.valueOf() + EpochOffset) * TicksPerMillisecond : undefined;
  }

  // some default formatting values
  public static DefaultLongFormat = 'dddd, LL';
  public static DefaultShortFormat = 'DD-MMM-YYYY';

  /**
   * Standardized string representation of a moment
   */
  public static format(value: moment.Moment | undefined, format = DateTime.DefaultLongFormat, defaultValue: any = null) {
    return value == null ? defaultValue : value.format(format);
  }

  public static formatLong(value: moment.Moment | undefined, defaultValue: any = null) {
    return DateTime.format(value, DateTime.DefaultLongFormat, defaultValue);
  }

  public static formatShort(value: moment.Moment | undefined, defaultValue: any = null) {
    return DateTime.format(value, DateTime.DefaultShortFormat, defaultValue);
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
  static fromString(value: string): moment.Duration;
  static fromString(value: string | undefined): moment.Duration | undefined;
  public static fromString(value: string | undefined) {
    return String.isNullOrEmpty(value) ? undefined : moment.duration(value);
  }

  /**
   * Converts a .NET TimeSpan.Ticks value to a moment duration
   */
  static fromNumber(value: number): moment.Duration;
  static fromNumber(value: number | undefined): moment.Duration | undefined;
  public static fromNumber(value: number | undefined) {
    return value == null ? undefined : moment.duration(value / TicksPerMillisecond);
  }

  /**
   * Converts a moment duration a .NET TimeSpan.Ticks amount
   */
  static toNumber(value: moment.Duration): number;
  static toNumber(value: moment.Duration | undefined): number | undefined;
  public static toNumber(value: moment.Duration | undefined) {
    return value == null ? undefined : value.asMilliseconds() * TicksPerMillisecond;
  }

  // some default formatting values
  public static DefaultDurationHoursPrecision = 1;
  public static DefaultDurationHoursPerDay = 8;

  /**
   * Standardized hours string representation of a duration
   */
  public static formatHours(value: moment.Duration | undefined, precision = TimeSpan.DefaultDurationHoursPrecision, defaultValue: any = null) {
    return value == null ? defaultValue : `${ value.asHours().toFixed(precision) } Hours`;
  }

  /**
   * Standardized days string representation of a duration
   */
  public static formatDays(value: moment.Duration | undefined, precision = TimeSpan.DefaultDurationHoursPrecision, hoursPerDay = TimeSpan.DefaultDurationHoursPerDay, defaultValue: any = null) {
    return value == null ? defaultValue : `${ moment.duration((value.asHours() / hoursPerDay), 'days').humanize() }`;
  }
}
