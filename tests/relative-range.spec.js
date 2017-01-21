/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai';
import RelativeRange, { DAY_FORMAT } from '../src/relative-range';

describe('RelativeRange', function () {
  beforeEach(function () {
    this.range = new RelativeRange();
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

    it('should not be isToDate', function () {
      expect(this.range.isToDate()).to.equal(false);
    });

    it('should have margin 1', function () {
      expect(this.range.margin).to.equal(1);
    });
  });

  describe('schema', function () {
    it('should check enum values', function () {
      const setBadType = () => { this.range.type = 'foo'; };

      expect(setBadType).to.throw();

      this.range.type = 'current';

      expect(this.range.type).to.equal('current');
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

  describe('#previous', function () {
    it('should return a relative range with the new values', function () {
      const clone = this.range.previous(5, 'day');

      expect(clone.date).to.not.equal(this.range.start);
      expect(clone.date.format()).to.equal(this.range.start.format());
      expect(clone.units).to.equal(5);
      expect(clone.measure).to.equal('day');
      expect(clone.type).to.equal('previous');
    });
  });

  describe('#current', function () {
    it('should return a relative range with the new values', function () {
      const clone = this.range.current('month');

      expect(clone.date).to.not.equal(this.range.end);
      expect(clone.date.format()).to.equal(this.range.end.format());
      expect(clone.start.date()).to.equal(1);
      expect(clone.units).to.equal(1);
      expect(clone.measure).to.equal('month');
      expect(clone.type).to.equal('current');
    });
  });

  describe('#next', function () {
    it('should return a relative range with the new values', function () {
      const clone = this.range.next(3, 'month');

      expect(clone.date).to.not.equal(this.range.end);
      expect(clone.start.date()).to.equal(1);
      expect(clone.units).to.equal(3);
      expect(clone.measure).to.equal('month');
      expect(clone.type).to.equal('next');
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

  describe('.date', function () {
    it('can be unset', function () {
      this.range.date = null;

      expect(this.range.date).to.equal(undefined);
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

  describe('next', function () {
    beforeEach(function () {
      this.range.type = 'next';
    });

    it('week', function () {
      this.range.measure = 'week';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-02-16');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-22');
    });

    it('isoWeek', function () {
      this.range.measure = 'isoWeeks';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-02-17');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-02-23');
    });

    it('month', function () {
      this.range.measure = 'month';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-03-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-03-31');
    });

    it('year', function () {
      this.range.measure = 'year';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3001-01-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3001-12-31');
    });

    it('quarter', function () {
      this.range.measure = 'quarter';

      expect(this.range.start.format(DAY_FORMAT), 'start date').to.equal('3000-04-01');
      expect(this.range.end.format(DAY_FORMAT), 'end date').to.equal('3000-06-30');
    });
  });

  describe('#toJSON', function () {
    it('should return the attributes of the range', function () {
      const json = this.range.toJSON();

      expect(json.date).to.be.a('string');
      expect(json.units).to.be.an('number');
      expect(json.measure).to.be.a('string');
      expect(json.margin).to.be.a('number');
      expect(json.length).to.not.be.ok;
      expect(json.whole).to.not.be.ok;
      expect(json.minimumStart).to.not.be.ok;
    });

    it('can overrule format', function () {
      this.range.date = '2000-01-01';
      const json = this.range.toJSON({ format: 'YMD' });

      expect(json.date).to.equal('200011');
    });

    it('can skip defaults', function () {
      const json = this.range.toJSON({ defaults: false });

      expect(json.date).to.be.a('string');
      expect(json.units).to.not.be.ok;
      expect(json.measure).to.not.be.ok;
      expect(json.margin).to.not.be.ok;
      expect(json.length).to.not.be.ok;
      expect(json.whole).to.not.be.ok;
      expect(json.minimumStart).to.not.be.ok;
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

  describe('.start', function () {
    describe('#set', function () {
      it('should lock the start date', function () {
        this.range.start = new Date(2000, 0, 1);

        expect(this.range.start.format(DAY_FORMAT)).to.equal('2000-01-01');
      });

      it('should be settable via #set', function () {
        this.range.set({ start: new Date(2000, 0, 1) });

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

      it('should be returned in toJSON if set and requested', function () {
        this.range.start = new Date(4000, 0, 15);

        expect(this.range.toJSON({ attributes: ['start'] }).start)
          .to.equal(this.range.start.format(DAY_FORMAT));
      });
    });
  });

  describe('.end', function () {
    describe('#set', function () {
      it('should lock the end date', function () {
        this.range.end = new Date(2000, 0, 1);

        expect(this.range.end.format(DAY_FORMAT)).to.equal('2000-01-01');
      });

      it('should be settable via #set', function () {
        this.range.set({ end: new Date(2000, 0, 1) });

        expect(this.range.end.format(DAY_FORMAT)).to.equal('2000-01-01');
      });

      it('can be unset', function () {
        this.range.end = new Date(2000, 0, 1);
        this.range.end = null;

        expect(this.range.end.format(DAY_FORMAT)).to.equal('3000-01-31');
      });

      it('should be returned in toJSON if set and requested', function () {
        this.range.end = new Date(4000, 0, 15);

        expect(this.range.toJSON({ attributes: ['end'] }).end)
          .to.equal(this.range.end.format(DAY_FORMAT));
      });
    });
  });

  describe('.minimumStart', function () {
    it('should maximize the start date', function () {
      this.range.minimumStart = new Date(3000, 0, 22);

      expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-01-22');
    });

    it('should never be larger than the end date', function () {
      this.range.minimumStart = new Date(4000, 0, 15);

      expect(this.range.start.format(DAY_FORMAT))
        .to.equal(this.range.end.format(DAY_FORMAT));
    });

    it('should never be outside the range', function () {
      this.range.minimumStart = new Date(2000, 0, 15);

      expect(this.range.start.format(DAY_FORMAT)).to.equal('3000-01-01');
    });

    it('should be returned in toJSON', function () {
      this.range.minimumStart = new Date(4000, 0, 15);

      expect(this.range.toJSON().minimumStart)
        .to.equal(this.range.minimumStart.format(DAY_FORMAT));
    });
  });

  describe('#lock', function () {
    it('should lock the start and end date', function () {
      this.range.lock();

      expect(this.range.data.start).to.be.ok;
      expect(this.range.data.end).to.be.ok;
    });

    it('should handle start as parameter', function () {
      this.range.lock('start');

      expect(this.range.data.start).to.be.ok;
      expect(this.range.data.end).to.not.be.ok;
    });

    it('should handle end as parameter', function () {
      this.range.lock('end');

      expect(this.range.data.start).to.not.be.ok;
      expect(this.range.data.end).to.be.ok;
    });
  });

  describe('#unlock', function () {
    beforeEach(function () {
      this.range.lock();
    });

    it('should unlock the start and end date', function () {
      this.range.unlock();

      // eslint-disable-next-line no-underscore-dangle
      expect(this.range.__start).to.not.be.ok;

      // eslint-disable-next-line no-underscore-dangle
      expect(this.range.__end).to.not.be.ok;
    });

    it('should handle start as parameter', function () {
      this.range.unlock('start');

      expect(this.range.data.start).to.not.be.ok;
      expect(this.range.data.end).to.be.ok;
    });

    it('should handle end as parameter', function () {
      this.range.unlock('end');

      expect(this.range.data.start).to.be.ok;
      expect(this.range.data.end).to.not.be.ok;
    });
  });

  describe('#isLocked', function () {
    it('should be false if not locked', function () {
      expect(this.range.isLocked()).to.equal(false);
    });

    it('should be true if locked', function () {
      this.range.lock();

      expect(this.range.isLocked()).to.equal(true);
    });

    it('should handle a part', function () {
      this.range.lock('start');

      expect(this.range.isLocked('start')).to.equal(true);
      expect(this.range.isLocked('end')).to.equal(false);
    });
  });
});
