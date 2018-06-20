import { Logger } from './Logger';
import { LogLevel } from './LogLevel';

export interface LogManager {
  getLogger(name: string, level?: LogLevel): Logger;
}
