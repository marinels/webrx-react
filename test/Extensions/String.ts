'use strict';

import { expect } from 'chai';

import '../../src/Extensions/String';

describe('String Extensions', () => {
  describe('String.IsNullOrEmpty', () => {
    it('returns true when a string is undefined', () => {
      let str: string;
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('returns true when a string is null', () => {
      let str: string = null;
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('returns true when a string is empty', () => {
      let str: string = '';
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('returns true when a string is empty', () => {
      let str: string = '';
      expect(String.isNullOrEmpty(str)).to.equal(true);
    });

    it('returns false when a string is non-empty', () => {
      let str: string = 'asdf';
      expect(String.isNullOrEmpty(str)).to.equal(false);
    });
  });

  describe('String.Format', () => {
    it('Can format an undefined string', () => {
      let format: string;
      let result = String.format(format);
      expect(result).to.equal(format);
    });

    it('Can format a null string', () => {
      let format: string = null;
      let result = String.format(format);
      expect(result).to.equal(format);
    });

    it('Can format an empty string', () => {
      let format: string = '';
      let result = String.format(format);
      expect(result).to.equal(format);
    });

    it('Can format a string with no placeholders and no args', () => {
      let format: string = 'asdf';
      let result = String.format(format);
      expect(result).to.equal(format);
    });

    it('Can format a string with no placeholders and unused args', () => {
      let format: string = 'asdf';
      let result = String.format(format, 123);
      expect(result).to.equal(format);
    });

    it('Can format a string with placeholders and matching args', () => {
      let format: string = 'asdf {0}';
      let result = String.format(format, 123);
      expect(result).to.equal('asdf 123');
    });

    it('Can format a string with placeholders and extra args', () => {
      let format: string = 'asdf {0}';
      let result = String.format(format, 123, 456);
      expect(result).to.equal('asdf 123');
    });

    it('Can format a string with placeholders and multiple args', () => {
      let format: string = 'asdf {0} {1}';
      let result = String.format(format, 123, 456);
      expect(result).to.equal('asdf 123 456');
    });

    it('Can format a string with multiple placeholders per arg', () => {
      let format: string = 'asdf {0} {1} {0}';
      let result = String.format(format, 123, 456);
      expect(result).to.equal('asdf 123 456 123');
    });
  });
});
