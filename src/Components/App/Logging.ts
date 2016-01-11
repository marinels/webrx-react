'use strict';

import LogLevel from '../../Utils/Logging/LogLevel';
import logManager from '../../Utils/Logging/Adapters/Console';

if (TEST) {
  logManager.defaultLevel = LogLevel.Off;
} else if (DEBUG) {
  logManager.defaultLevel = LogLevel.Debug;
} else {
  logManager.defaultLevel = LogLevel.Info;
}

let logger = logManager.getLogger('Logging');

logger.debug('Logging Active');

export default logManager;
