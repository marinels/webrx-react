import { LogLevel } from '../LogLevel';
import { BaseLogger, MessageDelegate } from '../Logger';
import { LogManager } from '../LogManager';

export class DelegateLogger extends BaseLogger {
  constructor(private action: (logger: DelegateLogger, level: LogLevel, text: string, args: any[]) => void, name: string, level: LogLevel) {
    super(name, level);
  }

  log(level: LogLevel | number, textOrFn: string | MessageDelegate, ...args: any[]) {
    if (this.isEnabledFor(level)) {
      if (textOrFn instanceof Function) {
        this.action(this, level, textOrFn(), args);
      }
      else {
        this.action(this, level, textOrFn.toString(), args);
      }
    }
  }
}

export class DelegateLogManager implements LogManager {
  constructor(private action: (logger: DelegateLogger, level: LogLevel, text: string, args: any[]) => void, public defaultLevel: LogLevel) {
  }

  getLogger(name: string, level?: LogLevel) {
    return new DelegateLogger(this.action, name, level || this.defaultLevel);
  }
}
