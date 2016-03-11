'use strict';

import { expect } from 'chai';
import { Mock, It, Times } from 'typemoq';

import { Alert } from '../../src/Utils/Alert';
import { AlertCreatedKey, IAlertCreated } from '../../src/Events/AlertCreated';
import { PubSub } from '../../src/Utils/PubSub';

describe('Alert Utils', () => {
  describe('create', () => {
    it('publishes basic alerts', () => {
      const content = 'testing';
      let mock = Mock.ofType(PubSub);
      mock.setup(x => x.publish(It.isAnyString(), It.isAny())).callback((key, args) => {
        expect(key).to.equal(AlertCreatedKey);
        expect(args).to.eql(<IAlertCreated>{
          content,
          header: undefined,
          style: undefined,
          timeout: undefined,
        });
      });
      let alert = new Alert(mock.object);
      alert.create(content);
    });
    it('will not create an alert for null or empty content/header', () => {
      let mock = Mock.ofType(PubSub);
      let alert = new Alert(mock.object);
      alert.create(null);
      alert.create(undefined);
      mock.verify(x => x.publish(It.isAnyString(), It.isAny()), Times.never());
    });
  });
});
