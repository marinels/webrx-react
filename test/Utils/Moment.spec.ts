import { should } from '../setup';
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

        should.exist(timestamp);
        timestamp!.isValid().should.be.true;
        timestamp!.utcOffset().should.eql(0);
        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('parses standard .NET DateTime strings', () => {
        const timestamp = DateTime.fromString(SampleDateTimeText);

        should.exist(timestamp);
        timestamp!.isValid().should.be.true;
        timestamp!.utcOffset().should.eql(0); // date times should default to UTC
        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('parses non-utc .NET DateTimeOffset strings', () => {
        let text = SampleDateTimeOffsetText.replace('4:', '8:').replace('+00', '+04');
        let timestamp = DateTime.fromString(text);

        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);

        text = SampleDateTimeOffsetText.replace('4:', '2:').replace('+00', '-02');
        timestamp = DateTime.fromString(text);

        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('parses non-standard DateTime strings with a valid format', () => {
        const text = 'Wed, 09 Mar 2016 16:32:32 GMT';
        const format = 'ddd, DD MMM YYYY HH:mm:ss Z';
        const timestamp = DateTime.fromString(text, format);

        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('parses non-standard DateTime strings with multiple formats', () => {
        const text = 'Wed, 09 Mar 2016 16:32:32 GMT';
        const formats = [
          'YYYY-MM-DD HH:mm:ss Z',
          'ddd, DD MMM YYYY HH:mm:ss Z',
        ];
        const timestamp = DateTime.fromString(text, ...formats);

        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('returns null for null input', () => {
        const timestamp = DateTime.fromString(undefined);

        should.not.exist(timestamp);
      });

      it('returns an invalid moment instance for a bad format', () => {
        const text = 'Wed, 09 Mar 2016 16:32:32 GMT';
        const format = 'YYYY-MM-DD HH:mm:ss Z';
        const timestamp = DateTime.fromString(text, format);

        should.not.exist(timestamp);
        timestamp!.isValid().should.be.false;
      });
    });

    describe('fromNumber', () => {
      it('converts .NET Ticks', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks, 0);

        should.exist(timestamp);
        timestamp!.isValid().should.be.true;
        timestamp!.utcOffset().should.eql(0);
        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('converts .NET Ticks with a numeric offset', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks, -8);

        should.exist(timestamp);
        timestamp!.utcOffset().should.eql(-8 * 60); // utcOffset() returns minutes
        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('converts .NET Ticks with a text offset', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks, '-08:00');

        should.exist(timestamp);
        timestamp!.utcOffset().should.eql(-8 * 60); // utcOffset() returns minutes
        timestamp!.valueOf().should.eql(SampleDateTimeUnixMilliseconds);
      });

      it('returns null for null input', () => {
        const timestamp = DateTime.fromNumber(undefined);

        should.not.exist(timestamp);
      });
    });

    describe('toNumber', () => {
      it('converts a moment value into ticks', () => {
        const timestamp = DateTime.fromNumber(SampleDateTimeTicks);
        should.exist(timestamp);

        const ticks = DateTime.toNumber(timestamp!);

        should.exist(ticks);
        ticks!.should.eql(SampleDateTimeTicks);
      });

      it('returns null for null input', () => {
        const ticks = DateTime.toNumber(undefined);

        should.not.exist(ticks);
      });

      it('returns null for an invalid moment value', () => {
        const timestamp = moment.invalid();
        const ticks = DateTime.toNumber(timestamp);

        should.not.exist(ticks);
      });
    });
  });

  describe('TimeSpan', () => {
    describe('fromString', () => {
      it('parses standard .NET TimeSpan strings', () => {
        const timespan = TimeSpan.fromString(SampleTimeSpanText);

        should.exist(timespan);
        timespan!.asMilliseconds().should.eql(SampleTimeSpanMilliseconds);
      });

      it('parses negative .NET TimeSpan strings', () => {
        const timespan = TimeSpan.fromString(`-${SampleTimeSpanText}`);

        should.exist(timespan);
        timespan!.asMilliseconds().should.eql(-1 * SampleTimeSpanMilliseconds);
      });

      it('return null for null input', () => {
        const timespan = TimeSpan.fromString(undefined);

        should.not.exist(timespan);
      });
    });

    describe('fromNumber', () => {
      it('converts standard .NET TimeSpan Ticks', () => {
        const timespan = TimeSpan.fromNumber(SampleTimeSpanTicks);

        should.exist(timespan);
        timespan!.asMilliseconds().should.eql(SampleTimeSpanMilliseconds);
      });

      it('converts negative values to negative durations', () => {
        const timespan = TimeSpan.fromNumber(-1 * TicksPerMillisecond);

        should.exist(timespan);
        timespan!.asMilliseconds().should.eql(-1);
      });

      it('returns null for null input', () => {
        const timespan = TimeSpan.fromNumber(undefined);

        should.not.exist(timespan);
      });
    });

    describe('toNumber', () => {
      it('converts a duration value into .NET Ticks', () => {
        const timespan = TimeSpan.fromNumber(SampleTimeSpanTicks);
        should.exist(timespan);

        const ticks = TimeSpan.toNumber(timespan!);

        should.exist(ticks);
        ticks!.should.eql(SampleTimeSpanTicks);
      });

      it('returns null for null input', () => {
        const ticks = TimeSpan.toNumber(undefined);

        should.not.exist(ticks);
      });
    });
  });
});
