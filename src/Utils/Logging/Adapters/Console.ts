import * as moment from 'moment';

import { LogLevel, getLevelName, DefaultLogLevel } from '../LogLevel';
import { DelegateLogManager, DelegateLogger } from './Delegate';

export class ConsoleLogManager extends DelegateLogManager {
  constructor(defaultLevel: LogLevel) {
    super((manager: ConsoleLogManager) => {
      return (logger, level, text, args) => manager.logAction(logger, level, text, args);
    }, defaultLevel);
  }

  private getColorStyle(bgColor = 'transparent', color = 'black') {
    return `display: block; border:0; margin: 0; padding: 5px 0; line-height: 19px; background-color: ${bgColor}; color: ${color};`;
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
    let styles = this.getStyles(level);

    this.logToConsole(
      level,
      `${styles.length > 0 ? '%c' : ''}[${moment().format('HH:mm:ss.SSS')}][${getLevelName(level)}][${logger.name}] ${text}`,
      ...styles
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

export const Default = new ConsoleLogManager(DefaultLogLevel);
