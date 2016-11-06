import { expect } from 'chai';

import '../../src/Extensions/String';

describe('String Extensions', () => {
  describe('String.IsNullOrEmpty', () => {
    it('Returns true when a string is undefined', () => {
      let str: string;
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('Returns true when a string is null', () => {
      let str: string = null;
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('Returns true when a string is empty', () => {
      let str: string = '';
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('Returns true when a string is empty', () => {
      let str: string = '';
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('Returns false when a string is non-empty', () => {
      let str: string = 'asdf';
      expect(String.isNullOrEmpty(str)).to.equal(false);
    });
  });

  describe('String.stringify', () => {
    it('Can handle a null value', () => {
      let val: any = null;
      expect(String.stringify(val)).to.equal(null);
    });

    it('Can stringify an empty object', () => {
      let val: any = {};
      expect(String.stringify(val)).to.equal(JSON.stringify(val, null, 2));
    });

    it('Can stringify a non-empty object', () => {
      let val: any = { text: 'test' };
      expect(String.stringify(val)).to.equal(JSON.stringify(val, null, 2));
    });

    it('Can stringify with custom spaces', () => {
      let val: any = { text: 'test' };
      expect(String.stringify(val, null, 4)).to.equal(JSON.stringify(val, null, 4));
    });

    it('Can stringify an object with an overridden toString() function', () => {
      class Test {
        public text = 'test';

        toString() {
          return this.text;
        }
      }

      let val = new Test();
      expect(String.stringify(val)).to.equal('test');
    });

    it('Can stringify an object with an overridden toString() function in a base class', () => {
      class Base {
        public text = 'test';

        toString() {
          return this.text;
        }
      }
      class Test extends Base {
      }

      let val = new Test();
      expect(String.stringify(val)).to.equal('test');
    });
  });
});
