'use strict';

import * as moment from 'moment';

import { LogLevel, getLevelName } from '../LogLevel';
import ILogger from '../Logger';
import DelegateLogManager from './Delegate';

export class ConsoleLogManager extends DelegateLogManager {
  constructor(defaultLevel: LogLevel) {
    super((action, level, text) => this.logAction(action, level, text), defaultLevel);
  }

  private getStyles(level: LogLevel) {
    // these colors should never get used
    let bgcolor = 'black';
    let color = 'white';

    if (level >= LogLevel.Fatal) {
      bgcolor = 'darkred';
      color = 'lightcoral';
    } else if (level >= LogLevel.Error) {
      bgcolor = 'lightcoral';
      color = 'black';
    } else if (level >= LogLevel.Warn) {
      bgcolor = 'blanchedalmond ';
      color = 'black';
    } else if (level >= LogLevel.Info) {
      bgcolor = 'lightblue ';
      color = 'black';
    } else if (level >= LogLevel.Debug) {
      bgcolor = 'lightcyan';
      color = 'black';
    } else {
      bgcolor = 'transparent';
      color = 'black';
    }

    return [
      String.format('background-color: {0}; color: {1}; margin: 0; padding: 3px 0', bgcolor, color)
    ];
  }

  private logAction(logger: ILogger, level: LogLevel, text: string) {
    this.logToConsole(
      String.format('%c[{0}][{1}][{2}] {3}', moment().format('HH:mm:ss.SSS'), getLevelName(level), logger.name, text),
      ...this.getStyles(level)
    );
  }

  private logToConsole(text: string, ...formatting: string[]) {
    console.log(text, ...formatting);
  }
}

export let Default = new ConsoleLogManager(LogLevel.Debug);

export default Default;
