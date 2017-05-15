import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import 'es6-shim';
import { Observable } from 'rx';
import { getLogger, LogLevel, Logger } from '../src/Utils/Logging';

declare var global: any;

// WebRx assumes a lot about the state of javascript.
// This setup will mock the assumptions so that we can continue testing its
// components without crashing.
function setupWebRx() {
  if (global == null) {
    global = {};
  }

  if (global.window == null) {
    // fake window for WebRx
    global.window = {
      navigator: {
        userAgent: 'Mocha',
      },
      location: {
        host: 'localhost',
        protocol: 'http',
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
      onPopState: Observable.never<PopStateEvent>(),
    };
  };
}

setupWebRx();

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

const should = chai.should();
const assert = chai.assert;
const expect = chai.expect;
let sandbox: sinon.SinonSandbox = <any>undefined;

chai.use(sinonChai);

const fail = (message?: string, operator?: string) => {
  should.fail(false, true, message, operator);
};

const logger: Logger = getLogger('test', LogLevel.All);

export { should, assert, expect, chai, fail, logger, sandbox, sinon };
