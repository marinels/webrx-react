'use strict';

import LogLevel from './LogLevel';
import ILogger from './Logger';
import DefaultLogManager from './Adapters/Console';

export interface ILogManager {
  getLogger(name: string, level?: LogLevel): ILogger;
}

let manager: ILogManager;

export function initialize(logManager?: ILogManager) {
  manager = logManager || DefaultLogManager;

  manager.getLogger('Logging').debug('Logging Active');
}

export function getLogger(name: string, level?: LogLevel) {
  if (manager == null) {
    initialize(DefaultLogManager);
  }

  return manager.getLogger(name, level);
}

export default ILogManager;
