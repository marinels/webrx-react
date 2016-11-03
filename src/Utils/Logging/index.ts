// // tslint:disable:no-unused-variable
// import * as LogLevelTypes from './LogLevel';
// import * as LoggerTypes from './Logger';
// import * as LogManagerTypes from './LogManager';
// import * as DelegateLogManagerTypes from './Adapters/Delegate';
// import * as ConsoleLogManagerTypes from './Adapters/Console';
// // tslint:enable:no-unused-variable

// export namespace Logging {
//   // export import LogLevel = LogLevelTypes.LogLevel;
//   // export import LogManager = LogManagerTypes.LogManager;
//   // export import Logger = LoggerTypes.Logger;
//   // export import MessageDelegate = LoggerTypes.MessageDelegate;
//   // export import ConsoleLogManager = ConsoleLogManagerTypes.ConsoleLogManager;
//   // export import DelegateLogManager = DelegateLogManagerTypes.DelegateLogManager;
//   // export import DelegateLogger = DelegateLogManagerTypes.DelegateLogger;
//   // export import BaseLogger = LoggerTypes.BaseLogger;

//   // export const initialize = LogManagerTypes.initialize;
//   // export const getLogger = LogManagerTypes.getLogger;
//   // export const getLevelName = LogLevelTypes.getLevelName;
// };

// export namespace
export * from './LogLevel';
export * from './Logger';
export * from './LogManager';

export * from './Adapters/Delegate';
export * from './Adapters/Console';

// export helper functions
import { LogLevel } from './LogLevel';
import { LogManager } from './LogManager';
import { Default as defaultLogManager } from './Adapters/Console';

let manager: LogManager;

export function initialize(logManager?: LogManager) {
  manager = logManager || defaultLogManager;

  manager.getLogger('Logging').debug('Logging Active');
}

export function getLogger(name: string, level?: LogLevel) {
  if (manager == null) {
    initialize(defaultLogManager);
  }

  return manager.getLogger(name, level);
}
