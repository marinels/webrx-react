// tslint:disable:max-classes-per-file

import { BaseLogger, MessageDelegate } from '../Logger';
import { LogLevel } from '../LogLevel';
import { LogManager } from '../LogManager';

export type DelegateLoggerAction = (
  logger: DelegateLogger,
  level: LogLevel,
  text: string,
  args: any[],
) => void;

export class DelegateLogger extends BaseLogger {
  constructor(
    private readonly action: DelegateLoggerAction,
    name: string,
    level: LogLevel,
  ) {
    super(name, level);
  }

  log(
    level: LogLevel | number,
    textOrFn: string | MessageDelegate,
    ...args: any[]
  ) {
    if (this.isEnabledFor(level)) {
      if (textOrFn instanceof Function) {
        this.action(this, level, textOrFn(), args);
      } else {
        this.action(this, level, textOrFn.toString(), args);
      }
    }
  }
}

export class DelegateLogManager implements LogManager {
  private readonly action: DelegateLoggerAction;

  constructor(
    action: (manager: DelegateLogManager) => DelegateLoggerAction,
    public defaultLevel: LogLevel,
  ) {
    this.action = action(this);
  }

  getLogger(name: string, level?: LogLevel) {
    return new DelegateLogger(
      this.action,
      name,
      level == null ? this.defaultLevel : level,
    );
  }
}
