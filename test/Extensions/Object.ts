'use strict';

import '../../src/Extensions/Object';

describe('Object Extensions', () => {
  describe('Object.assign', () => {
    it('Cannot have an undefined target', () => {
      let target: any;
      expect(() => Object.assign(target, {})).toThrow();
    });

    it('Cannot have a null target', () => {
      let target: any = null;
      expect(() => Object.assign(target, {})).toThrow();
    });

    it('Can have no source', () => {
      let target = {};
      let result = Object.assign(target);
      expect(result).toBeDefined();
      expect(result).toEqual(target);
    });

    it('Can have an undefined source', () => {
      let target = {};
      let source: any;
      let result = Object.assign(target, source);
      expect(result).toBeDefined();
      expect(result).toEqual(target);
    });

    it('Can have a null source', () => {
      let target = {};
      let source: any = null;
      let result = Object.assign(target, source);
      expect(result).toBeDefined();
      expect(result).toEqual(target);
    });

    it('Can merge an empty target and a single non-empty source', () => {
      let target = {};
      let source = { s1: 123 };
      let result = Object.assign(target, source);
      expect(result).toBeDefined();
      expect(result).toEqual(source);
    });

    it('Can merge an empty target and multiple sources', () => {
      let target = {};
      let result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      expect(result).toBeDefined();
      expect(result).toEqual({ s1: 4, s3: 56 });
    });

    it('Can merge a non-empty target and a single empty source', () => {
      let target = { t1: 123 };
      let source = {};
      let result = Object.assign(target, source);
      expect(result).toBeDefined();
      expect(result).toEqual(target);
    });

    it('Can merge a non-empty target and a single non-empty source', () => {
      let target = { t1: 123 };
      let source = { s1: 456 };
      let result = Object.assign(target, source);
      expect(result).toBeDefined();
      expect(result).toEqual({ t1: 123, s1: 456 });
    });

    it('Can merge a non-empty target and multiple sources', () => {
      let target = { t1: 123 };
      let result = Object.assign(target, { s1: 4 }, {}, { s3: 56 });
      expect(result).toBeDefined();
      expect(result).toEqual({ t1: 123, s1: 4, s3: 56 });
    });
  });

  describe('Object.Dispose', () => {
    it('Can dispose a null object', () => {
      expect(Object.dispose(null)).toBeNull();
    });

    it('Can dispose a non-null object that is not disposable', () => {
      expect(Object.dispose({})).toBeNull();
    });

    it('Can dispose a disposable', () => {
      let disposed = false;
      let disposable = new Rx.Disposable(() => disposed = true);
      expect(Object.dispose(disposable)).toBeNull();
      expect(disposed).toBe(true);
    });
  });

  describe('Object.GetName', () => {
    it('Can return a name of an undefined object', () => {
      let obj: any;
      let name = Object.getName(obj);
      expect(name).toBe('undefined');
    });

    it('Can return a name of a null object', () => {
      let obj: any = null;
      let name = Object.getName(obj);
      expect(name).toBe('undefined');
    });

    it('Can return a custom undefined name', () => {
      expect(Object.getName(null, 'asdf')).toBe('asdf');
    });

    it('Can return a name of a function', () => {
      function test() {
      }
      expect(Object.getName(test)).toBe('test');
    });

    it('Can return a name of an object instance', () => {
      class TestObj {
      }
      let obj = new TestObj();

      expect(Object.getName(obj)).toBe('TestObj');
    });
  });
});
