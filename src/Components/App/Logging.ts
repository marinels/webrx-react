'use strict';

import LogLevel from '../../Utils/Logging/LogLevel';
import logManager from '../../Utils/Logging/Adapters/Console';

logManager.defaultLevel = DEBUG === true ? LogLevel.Debug : LogLevel.Info;

let logger = logManager.getLogger('Logging');

logger.debug('Logging Active');

export default logManager;
