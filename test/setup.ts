import * as chai from 'chai';
import 'core-js';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { getLogger, Logger, LogLevel } from '../src/Utils/Logging';

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

chai.use(sinonChai);

const should = chai.should();
const assert = chai.assert;
const expect = chai.expect;
let sandbox: sinon.SinonSandbox;

const fail = (message?: string, operator?: string) => {
  should.fail(false, true, message, operator);
};

const logger: Logger = getLogger('test', LogLevel.All);

export { should, assert, expect, chai, fail, logger, sandbox, sinon };
