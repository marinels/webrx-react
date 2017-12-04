// import webrx-react version string
import { version } from './version';

// import all custom styles
import './Style/App.less';

// import core-js to standardize the ECMAScript api across browsers
import 'core-js';

// apply augmentations
import './types/augmentations';

// import extensions
import './Extensions';

// import webrx-react helper submodules
import * as Events from './Events';
import { Logging, PubSub, Alert, Compare, Moment } from './Utils';

// import WebRx framework
import * as wx from './WebRx';

// import webrx-react framework submodules
import * as Routing from './Routing';
import * as Stores from './Stores';
import * as Components from './Components';

// export everything
export { version, wx, Logging, PubSub, Alert, Compare, Moment };
export { Events, Routing, Stores, Components };

// inform the user which version we are using
// tslint:disable-next-line:no-console
Logging.getLogger('webrx-react').debug(`Loaded webrx-react: ${ version }`);
