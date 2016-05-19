import { LogLevel } from '../LogLevel';
import { ILogger, BaseLogger, IMessageDelegate } from '../Logger';
import { ILogManager } from '../LogManager';

class DelegateLogger extends BaseLogger {
  constructor(private action: (logger: ILogger, level: LogLevel, text: string, args: any[]) => void, name: string, level: LogLevel) {
    super(name, level);
  }

  log(level: LogLevel | number, textOrFn: string | IMessageDelegate, ...args: any[]) {
    if (this.isEnabledFor(level)) {
      if (textOrFn instanceof Function) {
        this.action(this, level, textOrFn(), args);
      } else {
        this.action(this, level, textOrFn.toString(), args);
      }
    }
  }
}

export class DelegateLogManager implements ILogManager {
  constructor(private action: (logger: ILogger, level: LogLevel, text: string, args: any[]) => void, public defaultLevel: LogLevel) {
  }

  getLogger(name: string, level?: LogLevel) {
    return new DelegateLogger(this.action, name, level || this.defaultLevel);
  }
}
