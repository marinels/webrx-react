import { should } from '../setup';

import '../../src/Extensions/String';

describe('String Extensions', () => {
  describe('String.IsNullOrEmpty', () => {
    it('Returns true when a string is undefined', () => {
      let str: string;
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns true when a string is null', () => {
      let str: string = null;
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns true when a string is empty', () => {
      let str: string = '';
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns true when a string is empty', () => {
      let str: string = '';
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns false when a string is non-empty', () => {
      let str: string = 'asdf';
      String.isNullOrEmpty(str).should.be.false;
    });
  });

  describe('String.stringify', () => {
    it('Can handle a null value', () => {
      let val: any = null;
      should.not.exist(String.stringify(val));
    });

    it('Can stringify an empty object', () => {
      let val: any = {};
      String.stringify(val).should.eql(JSON.stringify(val, null, 2));
    });

    it('Can stringify a non-empty object', () => {
      let val: any = { text: 'test' };
      String.stringify(val).should.eql(JSON.stringify(val, null, 2));
    });

    it('Can stringify with custom spaces', () => {
      let val: any = { text: 'test' };
      String.stringify(val, null, 4).should.eql(JSON.stringify(val, null, 4));
    });

    it('Can stringify an object with an overridden toString() function', () => {
      class Test {
        public text = 'test';

        toString() {
          return this.text;
        }
      }

      let val = new Test();
      String.stringify(val).should.eql('test');
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
      String.stringify(val).should.eql('test');
    });
  });
});
