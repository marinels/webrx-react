import { expect } from 'chai';
import * as moment from 'moment';

import { DateTime, TimeSpan, TicksPerMillisecond } from '../../src/Utils/Moment';

const SampleDateTimeOffsetText = '2016-03-09 4:32:32 PM +00:00';
const SampleDateTimeText = '2016-03-09 4:32:32 PM';
const SampleDateTimeTicks = 635931379520000000;
// var epochTicks = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).Ticks
// SampleDateTimeTicks - epochTicks == 1457541152000
const SampleDateTimeUnixMilliseconds = 1457541152000;

const SampleTimeSpanText = '1.05:37:46.6660000';
const SampleTimeSpanTicks = 1066666660000;
const SampleTimeSpanMilliseconds = SampleTimeSpanTicks / TicksPerMillisecond;

describe('Moment', () => {
  describe('DateTime', () => {
    describe('fromString', () => {
      it('parses standard .NET DateTimeOffset strings', () => {
        const timestamp = DateTime.fromString(SampleDateTimeOffsetText);

        expect(timestamp).to.be.not.null;
        expect(timestamp.isValid()).to.be.true;
        expect(timestamp.utcOffset()).to.equal(0);
        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('parses standard .NET DateTime strings', () => {
        const timestamp = DateTime.fromString(SampleDateTimeText);

        expect(timestamp).to.be.not.null;
        expect(timestamp.isValid()).to.be.true;
        expect(timestamp.utcOffset()).to.equal(0); // date times should default to UTC
        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('parses non-utc .NET DateTimeOffset strings', () => {
        let text = SampleDateTimeOffsetText.replace('4:', '8:').replace('+00', '+04');
        let timestamp = DateTime.fromString(text);

        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);

        text = SampleDateTimeOffsetText.replace('4:', '2:').replace('+00', '-02');
        timestamp = DateTime.fromString(text);
      });

      it('parses non-standard DateTime strings with a valid format', () => {
        const text = 'Wed, 09 Mar 2016 16:32:32 GMT';
        const format = 'ddd, DD MMM YYYY HH:mm:ss Z';
        const timestamp = DateTime.fromString(text, format);

        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('parses non-standard DateTime strings with multiple formats', () => {
        const text = 'Wed, 09 Mar 2016 16:32:32 GMT';
        const formats = [
          'YYYY-MM-DD HH:mm:ss Z',
          'ddd, DD MMM YYYY HH:mm:ss Z',
        ];
        const timestamp = DateTime.fromString(text, ...formats);

        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('returns null for null input', () => {
        const timestamp = DateTime.fromString(null);

        expect(timestamp).to.be.null;
      });

      it('returns an invalid moment instance for a bad format', () => {
        const text = 'Wed, 09 Mar 2016 16:32:32 GMT';
        const format = 'YYYY-MM-DD HH:mm:ss Z';
        const timestamp = DateTime.fromString(text, format);

        expect(timestamp.isValid()).to.be.false;
      });
    });

    describe('fromNumber', () => {
      it('converts .NET Ticks', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks, 0);

        expect(timestamp).to.be.not.null;
        expect(timestamp.isValid()).to.be.true;
        expect(timestamp.utcOffset()).to.equal(0);
        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('converts .NET Ticks with a numeric offset', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks, -8);

        expect(timestamp.utcOffset()).to.equal(-8 * 60); // utcOffset() returns minutes
        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('converts .NET Ticks with a text offset', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks, '-08:00');

        expect(timestamp.utcOffset()).to.equal(-8 * 60); // utcOffset() returns minutes
        expect(timestamp.valueOf()).to.equal(SampleDateTimeUnixMilliseconds);
      });

      it('returns null for null input', () => {
        const timestamp = DateTime.fromNumber(null);

        expect(timestamp).to.be.null;
      });
    });

    describe('toNumber', () => {
      it('converts a moment value into ticks', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks);
        const ticks = DateTime.toNumber(timestamp);

        expect(ticks).to.equal(SampleDateTimeTicks);
      });

      it('returns null for null input', () => {
        const ticks = DateTime.toNumber(null);

        expect(ticks).to.be.null;
      });

      it('returns null for an invalid moment value', () => {
        const timestamp = moment.invalid();
        const ticks = DateTime.toNumber(timestamp);

        expect(ticks).to.be.null;
      });
    });
  });

  describe('TimeSpan', () => {
    describe('fromString', () => {
      it('parses standard .NET TimeSpan strings', () => {
        const timespan = TimeSpan.fromString(SampleTimeSpanText);

        expect(timespan).to.be.not.null;
        expect(timespan.asMilliseconds()).to.equal(SampleTimeSpanMilliseconds);
      });

      it('parses negative .NET TimeSpan strings', () => {
        const timespan = TimeSpan.fromString(`-${SampleTimeSpanText}`);

        expect(timespan).to.be.not.null;
        expect(timespan.asMilliseconds()).to.equal(-1 * SampleTimeSpanMilliseconds);
      });

      it('return null for null input', () => {
        const timespan = TimeSpan.fromString(null);

        expect(timespan).to.be.null;
      });
    });

    describe('fromNumber', () => {
      it('converts standard .NET TimeSpan Ticks', () => {
        const timespan = TimeSpan.fromNumber(SampleTimeSpanTicks);

        expect(timespan).to.be.not.null;
        expect (timespan.asMilliseconds()).to.equal(SampleTimeSpanMilliseconds);
      });

      it('converts negative values to negative durations', () => {
        const timespan = TimeSpan.fromNumber(-1 * TicksPerMillisecond);

        expect(timespan).to.be.not.null;
        expect (timespan.asMilliseconds()).to.equal(-1);
      });

      it('returns null for null input', () => {
        const timespan = TimeSpan.fromNumber(null);

        expect(timespan).to.be.null;
      });
    });

    describe('toNumber', () => {
      it('converts a duration value into .NET Ticks', () => {
        const timespan = TimeSpan.fromNumber(SampleTimeSpanTicks);
        const ticks = TimeSpan.toNumber(timespan);

        expect(ticks).to.equal(SampleTimeSpanTicks);
      });

      it('returns null for null input', () => {
        const ticks = TimeSpan.toNumber(null);

        expect(ticks).to.be.null;
      });
    });
  });
});
