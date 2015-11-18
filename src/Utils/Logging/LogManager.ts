'use strict';

import LogLevel from './LogLevel';
import ILogger from './Logger';

export interface ILogManager {
  getLogger(name: string, level?: LogLevel): ILogger;
}

export default ILogManager;
