var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');

var PreviousDateRange = require('../lib/previous-date-range');

describe('moment.fn.previous', function() {
  it('should return a range', function() {
    var range = moment().previous(2, 'weeks');

    expect(moment.isMoment(range.start)).to.be.ok;
    expect(moment.isMoment(range.end)).to.be.ok;
  });
});

describe('PreviousDateRange', function() {
  beforeEach(function() {
    this.format = 'DD-MM-YYYY';
    this.range = new PreviousDateRange();
    this.range.date = new Date(3000, 1, 12, 12, 12);
  });

  it('should be an object with a start and an end value', function() {
    expect(this.range.start).to.be.ok;
    expect(this.range.end).to.be.ok;
  });

  it('should have a length', function() {
    expect(this.range.length).to.be.a('number');
  });

  describe('defaults', function() {
    it('should have units 1', function() {
      expect(this.range.units).to.equal(1);
    });

    it('should have measure "month"', function() {
      expect(this.range.measure).to.equal('month');
    });

    it('should have not be a toDate measure', function() {
      expect(this.range.toDate).to.equal(false);
    });

    it('should have be a whole measure', function() {
      expect(this.range.whole).to.equal(true);
    });
  });

  describe('#set', function() {
    it('should set units and measure', function() {
      this.range.set({
        measure: 'week',
        units: 2
      });
      expect(this.range.measure).to.equal('week');
      expect(this.range.units).to.equal(2);
    });
  });

  describe('#previous', function() {
    it('should set units and measure', function() {
      this.range.previous(5, 'day');
      expect(this.range.units).to.equal(5);
      expect(this.range.measure).to.equal('day');
    });
  });

  describe('cache', function() {
    it('should update the range when measure changes', function() {
      this.range.measure = 'day';
      var start1 = this.range.start.format('LLL');

      this.range.measure = 'week';
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when units changes', function() {
      this.range.units = 1;
      var start1 = this.range.start.format('LLL');

      this.range.units = 2;
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when whole changes', function() {
      this.range.whole = false;
      var start1 = this.range.start.format('LLL');

      this.range.whole = true;
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });

    it('should update the range when date changes', function() {
      this.range.date = new Date(3000, 1, 1);
      var start1 = this.range.start.format('LLL');

      this.range.date = new Date(3001, 1, 1);
      var start2 = this.range.start.format('LLL');

      expect(start1).to.not.equal(start2);
    });
  });

  describe('whole', function() {
    it('should return the length in days', function() {
      this.range.previous(2, 'week');
      
      expect(this.range.length).to.equal(14);
    });

    it('should return the dates in whole days', function() {
      expect(this.range.start.format('HH:mm:ss')).to.equal('00:00:00');
      expect(this.range.end.format('HH:mm:ss')).to.equal('23:59:59');
    });

    it('about the previous 2 months', function() {
      this.range.previous(2, 'month');
      
      expect(this.range.start.format(this.format), 'start date').to.equal('01-12-2999');
      expect(this.range.end.format(this.format), 'end date').to.equal('31-01-3000');
    });

    it('about the previous ISO week', function() {
      this.range.previous(1, 'isoWeek');
      
      expect(this.range.start.isoWeekday()).to.equal(1);
      expect(this.range.end.isoWeekday()).to.equal(7);
      expect(this.range.start.date(), 'start date').to.equal(3);
      expect(this.range.end.date(), 'end date').to.equal(9);
    });

    it('about the previous 4 days', function() {
      this.range.previous(4, 'days');

      expect(this.range.start.day()).to.equal(6);
      expect(this.range.end.day()).to.equal(2);
      expect(this.range.start.date(), 'start date').to.equal(8);
      expect(this.range.end.date(), 'end date').to.equal(11);
    });
  });

  describe('non whole', function() {
    beforeEach(function() {
      this.range.whole = false;
    });

    it('should return the length in days', function() {
      this.range.previous(2, 'weeks')

      expect(this.range.length).to.equal(14);
    });

    it('should return the dates in whole days', function() {
      expect(this.range.start.format('HH:mm:ss')).to.equal('00:00:00');
      expect(this.range.end.format('HH:mm:ss')).to.equal('23:59:59');
    });

    it('about the previous 2 months', function() {
      this.range.previous(2, 'months');

      expect(this.range.start.format(this.format), 'start date').to.equal('12-12-2999');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('about the previous ISO week', function() {
      this.range.previous(1, 'isoWeek');

      expect(this.range.start.isoWeekday()).to.equal(3);
      expect(this.range.end.isoWeekday()).to.equal(2);
      expect(this.range.start.date(), 'start date').to.equal(5);
      expect(this.range.end.date(), 'end date').to.equal(11);
    });

    it('about the previous 4 days', function() {
      this.range.previous(4, 'days');

      expect(this.range.start.day()).to.equal(6);
      expect(this.range.end.day()).to.equal(2);
      expect(this.range.start.date(), 'start date').to.equal(8);
      expect(this.range.end.date(), 'end date').to.equal(11);
    });
  });

  describe('<measure>ToDate', function() {
    it('weekToDate', function() {
      this.range.previous(2, 'weekToDate');

      expect(this.range.start.format(this.format), 'start date').to.equal('02-02-3000');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('isoWeekToDate', function() {
      this.range.measure = 'isoWeeksToDate';
      
      expect(this.range.start.format(this.format), 'start date').to.equal('10-02-3000');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('monthToDate', function() {
      this.range.measure = 'monthToDate';

      expect(this.range.start.format(this.format), 'start date').to.equal('01-02-3000');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });

    it('yearToDate', function() {
      this.range.previous(2, 'yearsToDate');

      expect(this.range.start.format(this.format), 'start date').to.equal('01-01-2999');
      expect(this.range.end.format(this.format), 'end date').to.equal('11-02-3000');
    });
  });

  describe('#toJSON', function() {
    it('should return the attributes of the range', function() {
      var json = this.range.toJSON();

      expect(json.units).to.be.an('number');
      expect(json.measure).to.be.a('string');
      expect(json.whole).to.be.a('boolean');
    });

    it('should not return date range keys', function() {
      var json = this.range.toJSON();

      expect(json.length).to.not.be.ok;
      expect(json.start).to.not.be.ok;
      expect(json.end).to.not.be.ok;
    });
  });
});
