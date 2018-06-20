import { should } from '../setup';

import '../../src/Extensions/Object';

describe('Object Extensions', () => {
  describe('Object.assign', () => {
    it('Cannot have an undefined target', () => {
      // tslint:disable-next-line:prefer-const
      let target: any;
      should.throw(() => Object.assign(target, {}));
    });

    it('Cannot have a null target', () => {
      const target: any = null;
      should.throw(() => Object.assign(target, {}));
    });

    it('Can have no source', () => {
      const target = {};
      const result = Object.assign(target);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can have an undefined source', () => {
      const target = {};
      // tslint:disable-next-line:prefer-const
      let source: any;
      const result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can have a null source', () => {
      const target = {};
      const source: any = null;
      const result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can merge an empty target and a single non-empty source', () => {
      const target = {};
      const source = { s1: 123 };
      const result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(source);
    });

    it('Can merge an empty target and multiple sources', () => {
      const target = {};
      const result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      should.exist(result);
      result.should.eql({ s1: 4, s3: 56 });
    });

    it('Can merge a non-empty target and a single empty source', () => {
      const target = { t1: 123 };
      const source = {};
      const result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can merge a non-empty target and a single non-empty source', () => {
      const target = { t1: 123 };
      const source = { s1: 456 };
      const result = Object.assign(target, source);
      should.exist(result);
      result.should.eql({ t1: 123, s1: 456 });
    });

    it('Can merge a non-empty target and multiple sources', () => {
      const target = { t1: 123 };
      const result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      should.exist(result);
      result.should.eql({ t1: 123, s1: 4, s3: 56 });
    });
  });

  describe('Object.GetName', () => {
    it('Can return a name of an undefined object', () => {
      // tslint:disable-next-line:prefer-const
      let obj: any;
      const name = Object.getName(obj);
      name.should.eql('undefined');
    });

    it('Can return a name of a null object', () => {
      const obj: any = null;
      const name = Object.getName(obj);
      name.should.eql('undefined');
    });

    it('Can return a custom undefined name', () => {
      Object.getName(null, 'asdf').should.eql('asdf');
    });

    it('Can return a name of a function', () => {
      function test() {
        // do nothing
      }
      Object.getName(test).should.eql('test');
    });

    it('Can return a name of an object instance', () => {
      class TestObj {}
      const obj = new TestObj();

      Object.getName(obj).should.eql('TestObj');
    });
  });
});
