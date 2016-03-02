'use strict';

import * as moment from 'moment';

import { LogLevel, getLevelName } from '../LogLevel';
import ILogger from '../Logger';
import DelegateLogManager from './Delegate';

export class ConsoleLogManager extends DelegateLogManager {
  constructor(defaultLevel: LogLevel) {
    super((action, level, text) => this.logAction(action, level, text), defaultLevel);
  }

  private getColorStyle(bgColor = 'transparent', color = 'black') {
    return `display: block; border:0; margin: 0; padding: 5px 0; line-height: 19px; background-color: ${bgColor}; color: ${color};`;
  }

  private getStyles(level: LogLevel) {
    let styles: string[] = [];

    if (level >= LogLevel.Fatal) {
    } else if (level >= LogLevel.Error) {
    } else if (level >= LogLevel.Warn) {
    } else if (level >= LogLevel.Info) {
      styles.push(this.getColorStyle('lightblue'));
    } else if (level >= LogLevel.Debug) {
      styles.push(this.getColorStyle('lightcyan'));
    } else {
      styles.push(this.getColorStyle());
    }

    return styles;
  }

  private logAction(logger: ILogger, level: LogLevel, text: string) {
    let styles = this.getStyles(level);

    this.logToConsole(
      `${styles.length > 0 ? '%c' : ''}[${moment().format('HH:mm:ss.SSS')}][${getLevelName(level)}][${logger.name}] ${text}`,
      level,
      ...styles
    );
  }

  private logToConsole(text: string, level: LogLevel, ...formatting: string[]) {
    if (level >= LogLevel.Error) {
      console.error(text, ...formatting);
    } else if (level >= LogLevel.Warn) {
      console.warn(text, ...formatting);
    } else if (level >= LogLevel.Info) {
      console.info(text, ...formatting);
    } else if (level >= LogLevel.Debug) {
      console.debug(text, ...formatting);
    } else {
      console.log(text, ...formatting);
    }
  }
}

export let Default = new ConsoleLogManager(LogLevel.Debug);

export default Default;
