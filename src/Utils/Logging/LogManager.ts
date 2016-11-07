import { LogLevel } from './LogLevel';
import { Logger } from './Logger';

export interface LogManager {
  getLogger(name: string, level?: LogLevel): Logger;
}
