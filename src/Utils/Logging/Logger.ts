import { LogLevel } from './LogLevel';

export interface MessageDelegate {
  (): string;
}

export interface Logger {
  name: string;
  level: LogLevel;

  isEnabledFor(level: LogLevel | number): boolean;

  log(level: LogLevel | number, text: string, ...args: any[]): void;
  log(level: LogLevel | number, fn: MessageDelegate, ...args: any[]): void;

  trace(text: string, ...args: any[]): void;
  trace(fn: MessageDelegate, ...args: any[]): void;

  debug(text: string, ...args: any[]): void;
  debug(fn: MessageDelegate, ...args: any[]): void;

  info(text: string, ...args: any[]): void;
  info(fn: MessageDelegate, ...args: any[]): void;

  warn(text: string, ...args: any[]): void;
  warn(fn: MessageDelegate, ...args: any[]): void;

  error(text: string, ...args: any[]): void;
  error(fn: MessageDelegate, ...args: any[]): void;

  fatal(text: string, ...args: any[]): void;
  fatal(fn: MessageDelegate, ...args: any[]): void;
}

export abstract class BaseLogger implements Logger {
  constructor(public name: string, public level: LogLevel | number) {
  }

  public isEnabledFor(level: LogLevel | number) {
    return this.level <= level;
  }

  abstract log(level: LogLevel | number, text: string, ...args: any[]): void;
  abstract log(level: LogLevel | number, fn: () => string, ...args: any[]): void;

  trace(textOrFn: string | MessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Trace, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Trace, textOrFn.toString(), ...args);
    }
  }

  debug(textOrFn: string | MessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Debug, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Debug, textOrFn.toString(), ...args);
    }
  }

  info(textOrFn: string | MessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Info, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Info, textOrFn.toString(), ...args);
    }
  }

  warn(textOrFn: string | MessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Warn, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Warn, textOrFn.toString(), ...args);
    }
  }

  error(textOrFn: string | MessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Error, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Error, textOrFn.toString(), ...args);
    }
  }

  fatal(textOrFn: string | MessageDelegate, ...args: any[]) {
    if (textOrFn instanceof Function) {
      this.log(LogLevel.Fatal, textOrFn, ...args);
    }
    else {
      this.log(LogLevel.Fatal, textOrFn.toString(), ...args);
    }
  }
}
