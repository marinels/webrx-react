// export webrx-react version string
export const version = VERSION;

// import all custom styles
import './Style/App.less';

// import core-js to standardize the ECMAScript api across browsers
import 'core-js';

// apply augmentations
import './types/augmentations';

// import extensions
import './Extensions';

// import WebRx
import * as wx from './WebRx';

// import webrx-react submodules
import { Logging, PubSub, Alert, Compare, Moment } from './Utils';
import * as Events from './Events';
import * as Routing from './Routing';
import * as Stores from './Stores';
import * as Components from './Components';

// export everything
export { wx, Logging, PubSub, Alert, Compare, Moment };
export { Events, Routing, Stores, Components };

// inform the user which version we are using
// tslint:disable-next-line:no-console
console.debug(`Loaded webrx-react: ${ version }`);
