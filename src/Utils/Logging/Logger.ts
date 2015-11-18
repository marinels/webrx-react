'use strict';

import LogLevel from './LogLevel';

export interface IMessageDelegate {
  (): string;
}

export interface ILogger {
  name: string;
  level: LogLevel;

  isEnabledFor(level: LogLevel | number): boolean;

  log(level: LogLevel | number, format: string, ...args: any[]): void;
  log(level: LogLevel | number, fn: IMessageDelegate): void;

  trace(format: string, ...args: any[]): void;
  trace(fn: IMessageDelegate): void;

  debug(format: string, ...args: any[]): void;
  debug(fn: IMessageDelegate): void;

  info(format: string, ...args: any[]): void;
  info(fn: IMessageDelegate): void;

  warn(format: string, ...args: any[]): void;
  warn(fn: IMessageDelegate): void;

  error(format: string, ...args: any[]): void;
  error(fn: IMessageDelegate): void;

  fatal(format: string, ...args: any[]): void;
  fatal(fn: IMessageDelegate): void;
}

export abstract class BaseLogger implements ILogger {
  constructor(public name: string, public level: LogLevel | number) {
  }

  public isEnabledFor(level: LogLevel | number) {
    return this.level <= level;
  }

  abstract log(level: LogLevel | number, format: string, ...args: any[]): void;
  abstract log(level: LogLevel | number, fn: () => string): void;

  trace(formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (formatOrFn instanceof Function) {
      this.log(LogLevel.Trace, formatOrFn);
    } else {
      this.log(LogLevel.Trace, formatOrFn as string, ...args);
    }
  }

  debug(formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (formatOrFn instanceof Function) {
      this.log(LogLevel.Debug, formatOrFn);
    } else {
      this.log(LogLevel.Debug, formatOrFn as string, ...args);
    }
  }

  info(formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (formatOrFn instanceof Function) {
      this.log(LogLevel.Info, formatOrFn);
    } else {
      this.log(LogLevel.Info, formatOrFn as string, ...args);
    }
  }

  warn(formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (formatOrFn instanceof Function) {
      this.log(LogLevel.Warn, formatOrFn);
    } else {
      this.log(LogLevel.Warn, formatOrFn as string, ...args);
    }
  }

  error(formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (formatOrFn instanceof Function) {
      this.log(LogLevel.Error, formatOrFn);
    } else {
      this.log(LogLevel.Error, formatOrFn as string, ...args);
    }
  }

  fatal(formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (formatOrFn instanceof Function) {
      this.log(LogLevel.Fatal, formatOrFn);
    } else {
      this.log(LogLevel.Fatal, formatOrFn as string, ...args);
    }
  }
}

export default ILogger;
