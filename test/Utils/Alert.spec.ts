import { should, sandbox, sinon } from '../setup';
import { Alert, Default as AlertDefault, create, createForError } from '../../src/Utils/Alert';
import { PubSub, Default as PubSubDefault } from '../../src/Utils/PubSub';
import { AlertCreatedKey, AlertCreated } from '../../src/Events/AlertCreated';

describe('Utils', () => {
  describe('Alert', () => {
    const mock = <{ publish: sinon.SinonStub }>{};
    const pubSub = <PubSub><any>mock;

    describe('create', () => {
      it('publishes alerts with only content', () => {
        pubSub.publish = sandbox.stub();

        new Alert(pubSub).create('test');

        mock.publish.should.have.been.calledOnce;
        mock.publish.should.have.been.calledWith(AlertCreatedKey, sinon.match({ content: 'test'}));
      });

      it('publishes alerts with only header', () => {
        pubSub.publish = sandbox.stub();

        new Alert(pubSub).create(null, 'test');

        mock.publish.should.have.been.calledOnce;
        mock.publish.should.have.been.calledWith(AlertCreatedKey, sinon.match({ header: 'test' }));
      });

      it('publishes alerts with a style override', () => {
        pubSub.publish = sandbox.stub();

        new Alert(pubSub).create('test', undefined, 'danger');

        mock.publish.should.have.been.calledOnce;
        mock.publish.should.have.been.calledWith(AlertCreatedKey, sinon.match({ content: 'test', style: 'danger' }));
      });

      it('publishes alerts with a timeout override', () => {
        pubSub.publish = sandbox.stub();

        new Alert(pubSub).create('test', undefined, undefined, 1000);

        mock.publish.should.have.been.calledOnce;
        mock.publish.should.have.been.calledWith(AlertCreatedKey, sinon.match({ content: 'test', timeout: 1000 }));
      });

      it('ignores calls where both header and content are null', () => {
        mock.publish = sandbox.stub();

        new Alert(pubSub).create(null);

        mock.publish.should.not.have.been.called;
      });
    });

    describe('createForError', () => {
      it('publishes a formatted alert for an error object');
      it('can inject a custom formatter');
      it('can extract status, code, and message from the error');
      it('can extract status, code, and message from an error property');
      it('stringifies the error object if no message is found');
      it('can extract the stack trace from the error');
      it('can extract the stack trace from an error property');
      it('logs the error content');
      it('logs the error object if stack trace logging is enabled');
    });

    describe('Default', () => {
      it('is a default alert instance that uses the default PubSub', () => {
        should.exist(AlertDefault);
        (<any>AlertDefault).pubSub.should.equal(PubSubDefault);
      });
    });

    describe('static create', () => {
      it('calls create on the default alert', () => {
        const stub = sandbox.stub(AlertDefault, 'create');

        create('test');

        stub.should.have.been.calledOnce;
        stub.should.have.been.calledWith('test', sinon.match.any);
      });
    });

    describe('static createForError', () => {
      it('calls createForError on the default alert', () => {
        const stub = sandbox.stub(AlertDefault, 'createForError');

        createForError('test');

        stub.should.have.been.calledOnce;
        stub.should.have.been.calledWith('test', sinon.match.any);
      });
    });
  });
});
