import { LogLevel } from './LogLevel';

export interface IMessageDelegate {
  (): string;
}

export interface ILogger {
  name: string;
  level: LogLevel;

  isEnabledFor(level: LogLevel | number): boolean;

  log(level: LogLevel | number, text: string, ...args: any[]): void;
  log(level: LogLevel | number, fn: IMessageDelegate, ...args: any[]): void;

  trace(text: string, ...args: any[]): void;
  trace(fn: IMessageDelegate, ...args: any[]): void;

  debug(text: string, ...args: any[]): void;
  debug(fn: IMessageDelegate, ...args: any[]): void;

  info(text: string, ...args: any[]): void;
  info(fn: IMessageDelegate, ...args: any[]): void;

  warn(text: string, ...args: any[]): void;
  warn(fn: IMessageDelegate, ...args: any[]): void;

  error(text: string, ...args: any[]): void;
  error(fn: IMessageDelegate, ...args: any[]): void;

  fatal(text: string, ...args: any[]): void;
  fatal(fn: IMessageDelegate, ...args: any[]): void;
}

export abstract class BaseLogger implements ILogger {
  constructor(public name: string, public level: LogLevel | number) {
  }

  public isEnabledFor(level: LogLevel | number) {
    return this.level <= level;
  }

  abstract log(level: LogLevel | number, text: string, ...args: any[]): void;
  abstract log(level: LogLevel | number, fn: () => string, ...args: any[]): void;

  trace(textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Trace, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Trace, textOrFn.toString(), ...args);
    }
  }

  debug(textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Debug, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Debug, textOrFn.toString(), ...args);
    }
  }

  info(textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Info, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Info, textOrFn.toString(), ...args);
    }
  }

  warn(textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Warn, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Warn, textOrFn.toString(), ...args);
    }
  }

  error(textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Error, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Error, textOrFn.toString(), ...args);
    }
  }

  fatal(textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Fatal, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Fatal, textOrFn.toString(), ...args);
    }
  }
}
