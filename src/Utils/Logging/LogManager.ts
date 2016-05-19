import { LogLevel } from './LogLevel';
import { ILogger } from './Logger';
import { Default as defaultLogManager } from './Adapters/Console';

export interface ILogManager {
  getLogger(name: string, level?: LogLevel): ILogger;
}

let manager: ILogManager;

export function initialize(logManager?: ILogManager) {
  manager = logManager || defaultLogManager;

  manager.getLogger('Logging').debug('Logging Active');
}

export function getLogger(name: string, level?: LogLevel) {
  if (manager == null) {
    initialize(defaultLogManager);
  }

  return manager.getLogger(name, level);
}
