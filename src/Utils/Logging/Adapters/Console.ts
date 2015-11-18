'use strict';

import * as moment from 'moment';

import { LogLevel, getLevelName } from '../LogLevel';
import ILogger from '../Logger';
import DelegateLogManager from './Delegate';

export class ConsoleLogManager extends DelegateLogManager {
  constructor(defaultLevel: LogLevel) {
    super(this.logToConsole, defaultLevel);
  }

  private logToConsole(logger: ILogger, level: LogLevel, text: string) {
    console.log(String.format('[{0}][{1}][{2}] {3}', moment().format('HH:mm:ss.SSS'), getLevelName(level), logger.name, text));
  }
}

export let Default = new ConsoleLogManager(LogLevel.Debug);

export default Default;
