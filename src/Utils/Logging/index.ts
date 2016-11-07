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
