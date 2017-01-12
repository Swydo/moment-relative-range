/* eslint-env mocha, chai */
/* eslint-disable no-var, vars-on-top, func-names, prefer-arrow-callback, no-unused-expressions */
var expect = require('chai').expect;

var PreviousDateRange = require('../lib/previous-date-range').default;

describe('PreviousDateRange', function () {
  beforeEach(function () {
    this.format = 'DD-MM-YYYY';
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
  });

  describe('#set', function () {
    it('should set units and measure', function () {
      this.range.set({
        measure: 'foo',
        units: 2,
      });
      expect(this.range.measure).to.equal('foo');
      expect(this.range.units).to.equal(2);
    });
  });

  describe('#clone', function () {
    it('should not be the same reference as the original', function () {
      var clone = this.range.clone();

      expect(this.range === clone).to.be.false;
    });

    it('should have the same values as the original', function () {
      var clone = this.range.clone();

      expect(clone.toJSON()).to.deep.equal(this.range.toJSON());
    });

    it('should respect passed data', function () {
      var clone = this.range.clone({
        units: 5,
        measure: 'foo',
      });

      expect(clone.units).to.equal(5);
      expect(clone.measure).to.equal('foo');
    });
  });

  describe('#previous', function () {
    it('should not set units and measure', function () {
      this.range.previous(5, 'day');

      expect(this.range.units).to.equal(1);
      expect(this.range.measure).to.equal('month');
    });

    it('should return a clone with the new values', function () {
      var clone = this.range.previous(5, 'day');

      expect(clone.units).to.equal(5);
      expect(clone.measure).to.equal('day');
    });
  });

  describe('cache', function () {
    it('should update the range when measure changes', function () {
      this.range.measure = 'day';
      var start1 = this.range.start.format('LLL');

      this.range.measure = 'week';
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when units changes', function () {
      this.range.units = 1;
      var start1 = this.range.start.format('LLL');

      this.range.units = 2;
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when whole changes', function () {
      this.range.whole = false;
      var start1 = this.range.start.format('LLL');

      this.range.whole = true;
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when date changes', function () {
      this.range.date = new Date(3000, 1, 1);
      var start1 = this.range.start.format('LLL');

      this.range.date = new Date(3001, 1, 1);
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });
  });

  describe('whole', function () {
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

      expect(this.range.start.format(this.format), 'start date').to.equal('01-12-2999');
      expect(this.range.end.format(this.format), 'end date').to.equal('31-01-3000');
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

      expect(this.range.start.format(this.format), 'start date').to.equal('12-12-2999');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
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

  describe('<measure>ToDate', function () {
    it('weekToDate', function () {
      this.range.units = 2;
      this.range.measure = 'weekToDate';

      expect(this.range.start.format(this.format), 'start date').to.equal('02-02-3000');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('isoWeekToDate', function () {
      this.range.measure = 'isoWeeksToDate';

      expect(this.range.start.format(this.format), 'start date').to.equal('10-02-3000');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('monthToDate', function () {
      this.range.measure = 'monthToDate';

      expect(this.range.start.format(this.format), 'start date').to.equal('01-02-3000');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('yearToDate', function () {
      this.range.units = 2;
      this.range.measure = 'yearsToDate';

      expect(this.range.start.format(this.format), 'start date').to.equal('01-01-2999');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });
  });

  describe('#toJSON', function () {
    it('should return the attributes of the range', function () {
      var json = this.range.toJSON();

      expect(json.units).to.be.an('number');
      expect(json.measure).to.be.a('string');
      expect(json.whole).to.be.a('boolean');
    });

    it('should not return date range keys', function () {
      var json = this.range.toJSON();

      expect(json.length).to.not.be.ok;
      expect(json.start).to.not.be.ok;
      expect(json.end).to.not.be.ok;
    });
  });
});
