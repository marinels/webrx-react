import * as moment from 'moment';

import { LogLevel, getLevelName, DefaultLogLevel } from '../LogLevel';
import { DelegateLogManager, DelegateLogger } from './Delegate';

// cleanup the console logging functions for legacy IE browsers
// see: https://stackoverflow.com/a/5539378/2789877
function sanitizeConsoleFunctions() {
  let consoleObject: StringMap<any> = console;

  // if console is missing for whatever reason, stub in an empty object
  // we will supply dummy logging functions for it
  // this should never be possible
  if (consoleObject == null) {
    (<any>window).console = consoleObject = {};
  }

  // if we don't have access to bind, then we can stub in a dummy function
  // this should never be possible
  const dummy = Function.prototype.bind != null ? undefined : () => { return; };

  // ensure we at least have a dummy console.log function
  consoleObject['log'] = consoleObject['log'] || dummy;

  // scan all used logging functions for necessary sanitization
  [ 'log', 'debug', 'info', 'warn', 'error' ]
    .filter(x => consoleObject[x] == null || typeof consoleObject[x] === 'object')
    .forEach(x => {
      // if the logging function doesn't exist then default to console.log
      if (consoleObject[x] == null) {
        consoleObject[x] = consoleObject['log'];
      }

      consoleObject[x] = Function.prototype.call.bind(consoleObject[x], consoleObject);
    });
}

export class ConsoleLogManager extends DelegateLogManager {
  constructor(defaultLevel: LogLevel) {
    super((manager: ConsoleLogManager) => {
      return (logger, level, text, args) => manager.logAction(logger, level, text, args);
    }, defaultLevel);
  }

  private getColorStyle(bgColor = 'transparent', color = 'black') {
    return `display: block; border:0; margin: 0; padding: 5px 0; line-height: 19px; background-color: ${ bgColor }; color: ${ color };`;
  }

  private getStyles(level: LogLevel) {
    let styles: string[] = [];

    if (level >= LogLevel.Fatal) {
      // do nothing
    }
    else if (level >= LogLevel.Error) {
      // do nothing
    }
    else if (level >= LogLevel.Warn) {
      // do nothing
    }
    else if (level >= LogLevel.Info) {
      styles.push(this.getColorStyle('lightblue'));
    }
    else if (level >= LogLevel.Debug) {
      styles.push(this.getColorStyle('lightcyan'));
    }
    else {
      styles.push(this.getColorStyle());
    }

    return styles;
  }

  private logAction(logger: DelegateLogger, level: LogLevel, text: string, args: any[]) {
    const styles = this.getStyles(level);

    this.logToConsole(
      level,
      `${ styles.length > 0 ? '%c' : '' }[${ moment().format('HH:mm:ss.SSS') }][${ getLevelName(level) }][${ logger.name }] ${ text }`,
      ...styles,
    );

    if (args != null && args.length > 0) {
      args.forEach(x => {
        this.logToConsole(level, x);
      });
    }
  }

  // tslint:disable:no-console
  private logToConsole(level: LogLevel, message: any, ...formatting: string[]) {
    if (level >= LogLevel.Error) {
      console.error(message, ...formatting);
    }
    else if (level >= LogLevel.Warn) {
      console.warn(message, ...formatting);
    }
    else if (level >= LogLevel.Info) {
      console.info(message, ...formatting);
    }
    else if (level >= LogLevel.Debug) {
      console.debug(message, ...formatting);
    }
    else {
      console.log(message, ...formatting);
    }
  }
  // tslint:enable:no-console
}

sanitizeConsoleFunctions();

export const Default = new ConsoleLogManager(DefaultLogLevel);
