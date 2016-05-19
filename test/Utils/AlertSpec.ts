import { expect } from 'chai';
import { Mock, It, Times } from 'typemoq';

import { Alert } from '../../src/Utils/Alert';
import { AlertCreatedKey, IAlertCreated } from '../../src/Events/AlertCreated';
import { PubSub } from '../../src/Utils/PubSub';

describe('Alert Utils', () => {
  describe('create', () => {
    it('publishes alerts with expected key and args', () => {
      const content = 'test content';
      const header = 'test header';
      const style = 'info';
      const timeout = 1000;

      let mock = Mock.ofType(PubSub);
      let alert = new Alert(mock.object);

      mock.setup(x => x.publish(It.isAnyString(), It.isAny())).callback((key, args) => {
        expect(key).to.equal(AlertCreatedKey);
        expect(args).to.eql(<IAlertCreated>{
          content,
          header,
          style,
          timeout,
        });
      });

      alert.create(content, header, style, timeout);

      mock.verify(x => x.publish(It.isAnyString(), It.isAny()), Times.once());
    });

    it('publishes alerts with only content', () => {
      let mock = Mock.ofType(PubSub);
      let alert = new Alert(mock.object);

      alert.create('testing');

      mock.verify(x => x.publish(It.isAnyString(), It.isAny()), Times.once());
    });

    it('will not publish an alert for null or empty content and header', () => {
      let mock = Mock.ofType(PubSub);
      let alert = new Alert(mock.object);

      alert.create(null, null);
      alert.create(null, undefined);
      alert.create(undefined, null);
      alert.create(undefined, undefined);

      mock.verify(x => x.publish(It.isAnyString(), It.isAny()), Times.never());
    });
  });
});
