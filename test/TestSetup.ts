declare var global: any;

import * as Rx from 'rx';

// WebRx assumes a lot about the state of javascript.
// This setup will mock the assumptions so that we can continue testing its
// components without crashing.
function setupWebRx() {
  if (global.window == null) {
    // fake window for WebRx
    global.window = {
      navigator: {
        userAgent: 'Mocha',
      },
    };
  }

  // fake document for WebRx
  if (global.document == null) {
    global.document = {
      createElement: () => {
        return {
          getElementsByTagName: () => {
            return {
              iElems: [ false ],
            };
          },
        };
      },
      implementation: {
        createHTMLDocument: () => {
          return {};
        },
      },
    };
  }

  // fake jasmine for WebRx
  global.window.jasmine = {
    version_: 'Mocha',
  };

  // WebRx calls this when in a unit test context
  // this is a fake (empty) result that won't interfere
  global.window.createMockHistory = () => {
    return {
      onPopState: Rx.Observable.never<PopStateEvent>(),
    };
  };
}

setupWebRx();
