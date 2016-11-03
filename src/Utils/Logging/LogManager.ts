import { LogLevel } from './LogLevel';
import { Logger } from './Logger';
// import { Default as defaultLogManager } from './Adapters/Console';

export interface LogManager {
  getLogger(name: string, level?: LogLevel): Logger;
}

// let manager: LogManager;

// export function initialize(logManager?: LogManager) {
//   manager = logManager || defaultLogManager;

//   manager.getLogger('Logging').debug('Logging Active');
// }

// export function getLogger(name: string, level?: LogLevel) {
//   if (manager == null) {
//     initialize(defaultLogManager);
//   }

//   return manager.getLogger(name, level);
// }
