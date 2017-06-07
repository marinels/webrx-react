import { should } from '../setup';

import '../../src/Extensions/Object';

describe('Object Extensions', () => {
  describe('Object.assign', () => {
    it('Cannot have an undefined target', () => {
      let target: any;
      should.throw(() => Object.assign(target, {}));
    });

    it('Cannot have a null target', () => {
      let target: any = null;
      should.throw(() => Object.assign(target, {}));
    });

    it('Can have no source', () => {
      let target = {};
      let result = Object.assign(target);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can have an undefined source', () => {
      let target = {};
      let source: any;
      let result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can have a null source', () => {
      let target = {};
      let source: any = null;
      let result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can merge an empty target and a single non-empty source', () => {
      let target = {};
      let source = { s1: 123 };
      let result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(source);
    });

    it('Can merge an empty target and multiple sources', () => {
      let target = {};
      let result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      should.exist(result);
      result.should.eql({ s1: 4, s3: 56 });
    });

    it('Can merge a non-empty target and a single empty source', () => {
      let target = { t1: 123 };
      let source = {};
      let result = Object.assign(target, source);
      should.exist(result);
      result.should.eql(target);
    });

    it('Can merge a non-empty target and a single non-empty source', () => {
      let target = { t1: 123 };
      let source = { s1: 456 };
      let result = Object.assign(target, source);
      should.exist(result);
      result.should.eql({ t1: 123, s1: 456 });
    });

    it('Can merge a non-empty target and multiple sources', () => {
      let target = { t1: 123 };
      let result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      should.exist(result);
      result.should.eql({ t1: 123, s1: 4, s3: 56 });
    });
  });

  describe('Object.GetName', () => {
    it('Can return a name of an undefined object', () => {
      let obj: any;
      let name = Object.getName(obj);
      name.should.eql('undefined');
    });

    it('Can return a name of a null object', () => {
      let obj: any = null;
      let name = Object.getName(obj);
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
      class TestObj {
      }
      let obj = new TestObj();

      Object.getName(obj).should.eql('TestObj');
    });
  });
});
