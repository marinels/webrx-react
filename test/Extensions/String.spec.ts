// tslint:disable:max-classes-per-file

import { should } from '../setup';

import '../../src/Extensions/String';

describe('String Extensions', () => {
  describe('String.IsNullOrEmpty', () => {
    it('Returns true when a string is undefined', () => {
      // tslint:disable-next-line:prefer-const
      let str: string | undefined;
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns true when a string is null', () => {
      const str: string | null = null;
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns true when a string is empty', () => {
      const str: string = '';
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns true when a string is empty', () => {
      const str: string = '';
      String.isNullOrEmpty(str).should.be.true;
    });

    it('Returns false when a string is non-empty', () => {
      const str: string = 'asdf';
      String.isNullOrEmpty(str).should.be.false;
    });
  });

  describe('String.stringify', () => {
    it('Can handle a null value', () => {
      const val: any = null;
      should.not.exist(String.stringify(val));
    });

    it('Can stringify an empty object', () => {
      const val: any = {};
      const str = String.stringify(val);

      should.exist(str);
      str!.should.eql(JSON.stringify(val, null, 2));
    });

    it('Can stringify a non-empty object', () => {
      const val: any = { text: 'test' };
      const str = String.stringify(val);

      should.exist(str);
      str!.should.eql(JSON.stringify(val, null, 2));
    });

    it('Can stringify with custom spaces', () => {
      const val: any = { text: 'test' };
      const str = String.stringify(val, null, 4);

      should.exist(str);
      str!.should.eql(JSON.stringify(val, null, 4));
    });

    it('Can stringify an object with an overridden toString() function', () => {
      class Test {
        public text = 'test';

        toString() {
          return this.text;
        }
      }

      const val = new Test();
      const str = String.stringify(val);

      should.exist(str);
      str!.should.eql('test');
    });

    it('Can stringify an object with an overridden toString() function in a base class', () => {
      class Base {
        public text = 'test';

        toString() {
          return this.text;
        }
      }
      class Test extends Base {}

      const val = new Test();
      const str = String.stringify(val);

      should.exist(str);
      str!.should.eql('test');
    });
  });
});
