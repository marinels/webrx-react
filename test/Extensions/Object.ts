import { expect } from 'chai';

import '../../src/Extensions/Object';

describe('Object Extensions', () => {
  describe('Object.assign', () => {
    it('Cannot have an undefined target', () => {
      let target: any;
      expect(() => Object.assign(target, {})).to.throw();
    });

    it('Cannot have a null target', () => {
      let target: any = null;
      expect(() => Object.assign(target, {})).to.throw();
    });

    it('Can have no source', () => {
      let target = {};
      let result = Object.assign(target);
      expect(result).to.exist;
      expect(result).to.deep.equal(target);
    });

    it('Can have an undefined source', () => {
      let target = {};
      let source: any;
      let result = Object.assign(target, source);
      expect(result).to.exist;
      expect(result).to.deep.equal(target);
    });

    it('Can have a null source', () => {
      let target = {};
      let source: any = null;
      let result = Object.assign(target, source);
      expect(result).to.exist;
      expect(result).to.deep.equal(target);
    });

    it('Can merge an empty target and a single non-empty source', () => {
      let target = {};
      let source = { s1: 123 };
      let result = Object.assign(target, source);
      expect(result).to.exist;
      expect(result).to.deep.equal(source);
    });

    it('Can merge an empty target and multiple sources', () => {
      let target = {};
      let result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      expect(result).to.exist;
      expect(result).to.deep.equal({ s1: 4, s3: 56 });
    });

    it('Can merge a non-empty target and a single empty source', () => {
      let target = { t1: 123 };
      let source = {};
      let result = Object.assign(target, source);
      expect(result).to.exist;
      expect(result).to.deep.equal(target);
    });

    it('Can merge a non-empty target and a single non-empty source', () => {
      let target = { t1: 123 };
      let source = { s1: 456 };
      let result = Object.assign(target, source);
      expect(result).to.exist;
      expect(result).to.deep.equal({ t1: 123, s1: 456 });
    });

    it('Can merge a non-empty target and multiple sources', () => {
      let target = { t1: 123 };
      let result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      expect(result).to.exist;
      expect(result).to.deep.equal({ t1: 123, s1: 4, s3: 56 });
    });
  });

  describe('Object.Dispose', () => {
    it('Can dispose a null object', () => {
      expect(Object.dispose(null)).to.be.null;
    });

    it('Can dispose a non-null object that is not disposable', () => {
      expect(Object.dispose({})).to.be.null;
    });

    it('Can dispose a disposable', () => {
      let disposed = false;
      let disposable = new Rx.Disposable(() => disposed = true);
      expect(Object.dispose(disposable)).to.be.null;
      expect(disposed).to.equal(true);
    });
  });

  describe('Object.GetName', () => {
    it('Can return a name of an undefined object', () => {
      let obj: any;
      let name = Object.getName(obj);
      expect(name).to.equal('undefined');
    });

    it('Can return a name of a null object', () => {
      let obj: any = null;
      let name = Object.getName(obj);
      expect(name).to.equal('undefined');
    });

    it('Can return a custom undefined name', () => {
      expect(Object.getName(null, 'asdf')).to.equal('asdf');
    });

    it('Can return a name of a function', () => {
      function test() {
        // do nothing
      }
      expect(Object.getName(test)).to.equal('test');
    });

    it('Can return a name of an object instance', () => {
      class TestObj {
      }
      let obj = new TestObj();

      expect(Object.getName(obj)).to.equal('TestObj');
    });
  });
});
