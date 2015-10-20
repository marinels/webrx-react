'use strict';

// WebRx calls this when in a unit test context
// this is a fake (empty) result that will won't interfere
(window as {[key: string]: any})['createMockHistory'] = () => {
  return { onPopState: Rx.Observable.never<PopStateEvent>() };
};
