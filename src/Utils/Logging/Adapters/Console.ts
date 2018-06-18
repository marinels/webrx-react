import * as moment from 'moment';

import { DefaultLogLevel, getLevelName, LogLevel } from '../LogLevel';
import { DelegateLogger, DelegateLogManager } from './Delegate';

export class ConsoleLogManager extends DelegateLogManager {
  private static readonly dummyConsole = {
    log: () => {
      return;
    },
  };

  constructor(defaultLevel: LogLevel) {
    super((manager: ConsoleLogManager) => {
      return (logger, level, text, args) =>
        manager.logAction(logger, level, text, args);
    }, defaultLevel);

    this.sanitizeConsoleObject();
  }

  private sanitizeConsoleObject() {
    // this is an added protection for IE9 to support console.log even if the
    // developer tools are not active.
    if (
      typeof window !== 'undefined' &&
      window != null &&
      window.console == null
    ) {
      (window as any).console = ConsoleLogManager.dummyConsole;
    }
  }

  private getColorStyle(bgColor = 'transparent', color = 'black') {
    return [
      'display:block',
      'border:0',
      'margin:0',
      'padding:5px 0',
      'line-height:19px',
      `background-color:${bgColor}`,
      `color:${color}`,
    ].join(';');
  }

  private getStyles(level: LogLevel) {
    const styles: string[] = [];

    if ((window as any).chrome != null) {
      if (level >= LogLevel.Fatal) {
        // do nothing
      } else if (level >= LogLevel.Error) {
        // do nothing
      } else if (level >= LogLevel.Warn) {
        // do nothing
      } else if (level >= LogLevel.Info) {
        styles.push(this.getColorStyle('lightblue'));
      } else if (level >= LogLevel.Debug) {
        styles.push(this.getColorStyle('lightcyan'));
      } else {
        styles.push(this.getColorStyle());
      }
    }

    return styles;
  }

  private logAction(
    logger: DelegateLogger,
    level: LogLevel,
    text: string,
    args: any[],
  ) {
    try {
      const styles = this.getStyles(level);
      const style = styles.length > 0 ? '%c' : '';
      const timestamp = moment().format('HH:mm:ss.SSS');

      this.logToConsole(
        level,
        `${style}[${timestamp}][${getLevelName(level)}][${
          logger.name
        }] ${text}`,
        ...styles,
      );

      if (args != null && args.length > 0) {
        args.filterNull().forEach(x => {
          this.logToConsole(level, x);
        });
      }
    } catch (e) {
      // do nothing
    }
  }

  private getLogFunction(level: LogLevel): () => void {
    const noop = () => {
      return;
    };

    const coerceLogFunction = (fn: undefined | typeof console.log) => {
      if (fn == null) {
        fn = console.log;
      }

      if (fn == null) {
        return noop;
      }

      if (fn instanceof Function) {
        return fn;
      }

      return (message?: any, ...optionalParams: any[]) => {
        // try and log the message if we can
        if (!String.isNullOrEmpty(message)) {
          fn!(message);
        }
      };
    };

    if (console == null) {
      return noop;
    } else if (level >= LogLevel.Error) {
      return coerceLogFunction(console.error);
    } else if (level >= LogLevel.Warn) {
      return coerceLogFunction(console.warn);
    } else if (level >= LogLevel.Info) {
      return coerceLogFunction(console.info);
    } else if (level >= LogLevel.Debug) {
      return coerceLogFunction(console.debug);
    } else {
      return coerceLogFunction(console.log);
    }
  }

  public logToConsole(level: LogLevel, message: any, ...formatting: string[]) {
    try {
      const fn = this.getLogFunction(level);

      const consoleRef =
        console === ConsoleLogManager.dummyConsole ? undefined : console;

      fn.apply(consoleRef, [message].concat(formatting));
    } catch (e) {
      // do nothing
    }
  }
}

export const Default = new ConsoleLogManager(DefaultLogLevel);
