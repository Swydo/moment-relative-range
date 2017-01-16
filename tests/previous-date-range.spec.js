/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai';
import PreviousDateRange, { DAY_FORMAT } from '../src/previous-date-range';

describe('PreviousDateRange', function () {
  beforeEach(function () {
    this.range = new PreviousDateRange();
    this.range.date = new Date(3000, 1, 12, 12, 12);
  });

  it('should be an object with a start and an end value', function () {
    expect(this.range.start).to.be.ok;
    expect(this.range.end).to.be.ok;
  });

  it('should have a length', function () {
    expect(this.range.length).to.be.a('number');
  });

  describe('defaults', function () {
    it('should have units 1', function () {
      expect(this.range.units).to.equal(1);
    });

    it('should have measure "month"', function () {
      expect(this.range.measure).to.equal('month');
    });

    it('should not be a isToDate measure', function () {
      expect(this.range.isToDate).to.equal(false);
    });

    it('should have be a whole measure', function () {
      expect(this.range.whole).to.equal(true);
    });

    it('should have margin 1', function () {
      expect(this.range.margin).to.equal(1);
    });
  });

  describe('#set', function () {
    it('should set attributes', function () {
      this.range.set({
        measure: 'foo',
        units: 2,
      });
      expect(this.range.measure).to.equal('foo');
      expect(this.range.units).to.equal(2);
    });

    it('should not set disallowed attributes', function () {
      this.range.set({ foo: 'foo' });

      expect(this.range.foo, 'disallowed attribute').to.equal(undefined);
    });
  });

  describe('#clone', function () {
    it('should not be the same reference as the original', function () {
      const clone = this.range.clone();

      expect(this.range === clone).to.be.false;
    });

    it('should have the same values as the original', function () {
      const clone = this.range.clone();

      expect(clone.toJSON({ skipGetters: true }))
        .to.deep.equal(this.range.toJSON({ skipGetters: true }));
    });

    it('should respect passed data', function () {
      const clone = this.range.clone({
        units: 5,
        measure: 'foo',
      });

      expect(clone.units).to.equal(5);
      expect(clone.measure).to.equal('foo');
    });

    it('should not set defaults on clone', function () {
      const clone = this.range.clone();

      expect(clone.__whole).to.equal(undefined); // eslint-disable-line no-underscore-dangle
    });
  });

  describe('#previous', function () {
    it('should not set units and measure', function () {
      this.range.previous(5, 'day');

      expect(this.range.units).to.equal(1);
      expect(this.range.measure).to.equal('month');
    });

    it('should return a clone with the new values', function () {
      const clone = this.range.previous(5, 'day');

      expect(clone.units).to.equal(5);
      expect(clone.measure).to.equal('day');
    });
  });

  describe('reactivity', function () {
    it('should update the range when measure changes', function () {
      this.range.measure = 'day';
      const start1 = this.range.start.format('LLL');

      this.range.measure = 'week';
      const start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when units changes', function () {
      this.range.units = 1;
      const start1 = this.range.start.format('LLL');

      this.range.units = 2;
      const start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when whole changes', function () {
      this.range.whole = false;
      const start1 = this.range.start.format('LLL');

      this.range.whole = true;
      const start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when date changes', function () {
      this.range.date = new Date(3000, 1, 1);
      const start1 = this.range.start.format('LLL');

      this.range.date = new Date(3001, 1, 1);
      const start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });
  });

  describe('.margin', function () {
    it('should move the date range', function () {
      this.range.measure = 'day';
      this.range.units = 2;
      this.range.margin = 0;

      expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-02-11');
      expect(this.range.end.format(DAY_FORMAT)).to.equal('3000-02-12');

      this.range.margin = 2;

      expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-02-09');
      expect(this.range.end.format(DAY_FORMAT)).to.equal('3000-02-10');
    });

    it('should handle whole month', function () {
      this.range.date = new Date(3000, 0, 1);

      expect(this.range.start.format(DAY_FORMAT)).to.equal('2999-12-01');
      expect(this.range.end.format(DAY_FORMAT)).to.equal('2999-12-31');

      this.range.margin = 2;

      expect(this.range.start.format(DAY_FORMAT)).to.equal('2999-11-01');
      expect(this.range.end.format(DAY_FORMAT)).to.equal('2999-11-30');
    });
  });

  describe('.whole', function () {
    it('should return the length in days', function () {
      this.range.units = 2;
      this.range.measure = 'weeks';

      expect(this.range.length).to.equal(14);
    });

    it('should return the dates in whole days', function () {
      expect(this.range.start.format('HH:mm:ss')).to.equal('00:00:00');
      expect(this.range.end.format('HH:mm:ss')).to.equal('23:59:59');
    });

    it('about the previous 2 months', function () {
      this.range.units = 2;
      this.range.measure = 'months';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('2999-12-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-01-31');
    });

    it('about the previous ISO week', function () {
      this.range.measure = 'isoWeek';

      expect(this.range.start.isoWeekday()).to.equal(1);
      expect(this.range.end.isoWeekday()).to.equal(7);
      expect(this.range.start.date(), 'start date').to.equal(3);
      expect(this.range.end.date(), 'end date').to.equal(9);
    });

    it('about the previous 4 days', function () {
      this.range.units = 4;
      this.range.measure = 'days';

      expect(this.range.start.day()).to.equal(6);
      expect(this.range.end.day()).to.equal(2);
      expect(this.range.start.date(), 'start date').to.equal(8);
      expect(this.range.end.date(), 'end date').to.equal(11);
    });

    it('quarter', function () {
      this.range.measure = 'quarter';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('2999-10-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('2999-12-31');
    });
  });

  describe('non whole', function () {
    beforeEach(function () {
      this.range.whole = false;
    });

    it('should return the length in days', function () {
      this.range.units = 2;
      this.range.measure = 'weeks';

      expect(this.range.length).to.equal(14);
    });

    it('should return the dates in whole days', function () {
      expect(this.range.start.format('HH:mm:ss')).to.equal('00:00:00');
      expect(this.range.end.format('HH:mm:ss')).to.equal('23:59:59');
    });

    it('about the previous 2 months', function () {
      this.range.units = 2;
      this.range.measure = 'months';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('2999-12-12');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-11');
    });

    it('about the previous ISO week', function () {
      this.range.measure = 'isoWeek';

      expect(this.range.start.isoWeekday()).to.equal(3);
      expect(this.range.end.isoWeekday()).to.equal(2);
      expect(this.range.start.date(), 'start date').to.equal(5);
      expect(this.range.end.date(), 'end date').to.equal(11);
    });

    it('about the previous 4 days', function () {
      this.range.units = 4;
      this.range.measure = 'days';

      expect(this.range.start.day()).to.equal(6);
      expect(this.range.end.day()).to.equal(2);
      expect(this.range.start.date(), 'start date').to.equal(8);
      expect(this.range.end.date(), 'end date').to.equal(11);
    });
  });

  describe('current', function () {
    beforeEach(function () {
      this.range.type = 'current';
    });

    it('week', function () {
      this.range.measure = 'week';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-02-09');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-11');
    });

    it('isoWeek', function () {
      this.range.measure = 'isoWeeks';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-02-10');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-11');
    });

    it('month', function () {
      this.range.measure = 'month';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-02-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-11');
    });

    it('year', function () {
      this.range.measure = 'year';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-01-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-11');
    });

    it('quarter', function () {
      this.range.measure = 'quarter';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-01-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-11');
    });
  });

  describe('#toJSON', function () {
    it('should return the attributes of the range', function () {
      const json = this.range.toJSON();

      expect(json.units).to.be.an('number');
      expect(json.measure).to.be.a('string');
      expect(json.whole).to.be.a('boolean');
      expect(json.margin).to.be.a('number');
      expect(json.fixedStart).to.not.be.ok;
    });

    it('should not return date range keys', function () {
      const json = this.range.toJSON();

      expect(json.length).to.not.be.ok;
      expect(json.start).to.not.be.ok;
      expect(json.end).to.not.be.ok;
    });
  });

  describe('#toArray', function () {
    it('should have length 2', function () {
      const array = this.range.toArray();

      expect(array.length).to.equal(2);
    });

    it('should have YYYY-MM-DD as default format', function () {
      const array = this.range.toArray();

      expect(array[0]).to.equal(this.range.start.format(DAY_FORMAT));
      expect(array[0]).to.equal(this.range.start.format(DAY_FORMAT));
    });

    it('should accept custom format', function () {
      const customFormat = 'LLL';
      const array = this.range.toArray(customFormat);

      expect(array[0]).to.equal(this.range.start.format(customFormat));
      expect(array[0]).to.equal(this.range.start.format(customFormat));
    });
  });

  describe('start', function () {
    describe('#set', function () {
      it('should lock the start date', function () {
        this.range.start = new Date(2000, 0, 1);

        expect(this.range.start.format(DAY_FORMAT)).to.equal('2000-01-01');
      });

      it('can be unset', function () {
        this.range.start = new Date(2000, 0, 1);
        this.range.start = null;

        expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-01-01');
      });

      it('should never be larger than the end date', function () {
        this.range.start = new Date(4000, 0, 15);

        expect(this.range.start.format(DAY_FORMAT))
          .to.equal(this.range.end.format(DAY_FORMAT));
      });
    });
  });

  describe('.fixedStart', function () {
    it('should maximize the start date', function () {
      this.range.fixedStart = new Date(3000, 0, 22);

      expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-01-22');
    });

    it('should never be larger than the end date', function () {
      this.range.fixedStart = new Date(4000, 0, 15);

      expect(this.range.start.format(DAY_FORMAT))
        .to.equal(this.range.end.format(DAY_FORMAT));
    });

    it('should never be outside the range', function () {
      this.range.fixedStart = new Date(2000, 0, 15);

      expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-01-01');
    });

    it('should be returned in toJSON', function () {
      this.range.fixedStart = new Date(4000, 0, 15);

      expect(this.range.toJSON().fixedStart).to.equal(this.range.fixedStart);
    });
  });
});
