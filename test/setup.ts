import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import 'es6-shim';

import { getLogger, LogLevel, Logger } from '../src/Utils/Logging';

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
