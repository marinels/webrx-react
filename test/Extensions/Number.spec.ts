import { should } from '../setup';

import '../../src/Extensions/Number';

describe.only('Number Extensions', () => {
  describe('Number.isNumber', () => {
    it('should return true for an integer', () => {
      Number.isNumber(1).should.be.true;
    });

    it('should return true for an float', () => {
      Number.isNumber(1.23).should.be.true;
    });

    it('should return true for an float with no decimal numbers', () => {
      Number.isNumber(1.).should.be.true;
    });

    it('should return true for NaN', () => {
      Number.isNumber(NaN).should.be.true;
    });

    it('should return false for undefined', () => {
      Number.isNumber(undefined).should.be.false;
    });

    it('should return false for null', () => {
      Number.isNumber(null).should.be.false;
    });

    it('should return false for empty string', () => {
      Number.isNumber('').should.be.false;
    });

    it('should return false for a non-decimal string', () => {
      Number.isNumber('123').should.be.false;
    });

    it('should return false for a decimal string', () => {
      Number.isNumber('1.23').should.be.false;
    });

    it('should return false for an decimal string with no decimal numbers', () => {
      Number.isNumber('1.').should.be.false;
    });

    it('should return false for an object', () => {
      Number.isNumber({}).should.be.false;
    });

    it('acts as a type guard for a non-numeric value', () => {
      let val: any = 123;

      Number.isNumber(val) && val.toFixed(1).should.eql('123.0');
    });
  });

  describe('Number.isNumeric', () => {
    it('should return true for an integer', () => {
      Number.isNumeric(1).should.be.true;
    });

    it('should return true for an float', () => {
      Number.isNumeric(1.23).should.be.true;
    });

    it('should return true for an float with no decimal numbers', () => {
      Number.isNumeric(1.).should.be.true;
    });

    it('should return false for NaN', () => {
      Number.isNumeric(NaN).should.be.false;
    });

    it('should return false for undefined', () => {
      Number.isNumeric(undefined).should.be.false;
    });

    it('should return false for null', () => {
      Number.isNumeric(null).should.be.false;
    });

    it('should return false for empty string', () => {
      Number.isNumeric('').should.be.false;
    });

    it('should return true for a non-decimal string', () => {
      Number.isNumeric('123').should.be.true;
    });

    it('should return true for a decimal string', () => {
      Number.isNumeric('1.23').should.be.true;
    });

    it('should return true for an decimal string with no decimal numbers', () => {
      Number.isNumeric('1.').should.be.true;
    });

    it('should return false for an object', () => {
      Number.isNumeric({}).should.be.false;
    });
  });

  describe('Number.isInt', () => {
    it('should return true for an integer', () => {
      Number.isInt(1).should.be.true;
    });

    it('should return false for an float', () => {
      Number.isInt(1.23).should.be.false;
    });

    it('should return true for an float with no decimal numbers', () => {
      Number.isInt(1.).should.be.true;
    });

    it('should return false for NaN', () => {
      Number.isInt(NaN).should.be.false;
    });

    it('should return false for undefined', () => {
      Number.isInt(undefined).should.be.false;
    });

    it('should return false for null', () => {
      Number.isInt(null).should.be.false;
    });

    it('should return false for empty string', () => {
      Number.isInt('').should.be.false;
    });

    it('should return false for a non-decimal string', () => {
      Number.isInt('123').should.be.false;
    });

    it('should return false for a decimal string', () => {
      Number.isInt('1.23').should.be.false;
    });

    it('should return false for an decimal string with no decimal numbers', () => {
      Number.isInt('1.').should.be.false;
    });

    it('should return false for an object', () => {
      Number.isInt({}).should.be.false;
    });
  });
});
