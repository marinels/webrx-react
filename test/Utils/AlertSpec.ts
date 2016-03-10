'use strict';

import { expect } from 'chai';

import { Alert } from '../../src/Utils/Alert';
import { AlertCreatedKey, IAlertCreated } from '../../src/Events/AlertCreated';

describe('Alert Utils', () => {
  describe('Alert.create', () => {
    it('will not create an alert for null or empty content/header', () => {
      let alertArgs: IAlertCreated = null;
      // mock PubSub.publish(...)
      Alert.create(null);

      expect(alertArgs).to.be.null;
    });
  });
});
