/// <reference path="./types/declarations.d.ts" />

// import all custom styles
import './Style/App.less';

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
