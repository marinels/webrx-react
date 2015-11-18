'use strict';

import { LogLevel, getLevelName } from '../LogLevel';
import { ILogger, BaseLogger, IMessageDelegate } from '../Logger';
import ILogManager from '../LogManager';

class DelegateLogger extends BaseLogger {
  constructor(private action: (logger: ILogger, level: LogLevel, text: string) => void, name: string, level: LogLevel) {
    super(name, level);
  }

  log(level: LogLevel | number, formatOrFn: string | IMessageDelegate, ...args: any[]) {
    if (this.isEnabledFor(level)) {
      if (formatOrFn instanceof Function) {
        this.action(this, level, formatOrFn());
      } else {
        this.log(level, () => String.format(formatOrFn as string, ...args));
      }
    }
  }
}

export class DelegateLogManager implements ILogManager {
  constructor(private action: (logger: ILogger, level: LogLevel, text: string) => void, public defaultLevel: LogLevel) {
  }

  getLogger(name: string, level?: LogLevel) {
    return new DelegateLogger(this.action, name, level || this.defaultLevel);
  }
}

export default DelegateLogManager;
