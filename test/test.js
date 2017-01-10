var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');

describe('PreviousDateRange', function() {
  beforeEach(function() {
    var Range = require('../lib/previous-date-range');
    this.format = 'DD-MM-YYYY';
    this.date = new Date(3000, 1, 12);
    this.range = new Range;
  });

  describe('defaults', function() {
    it('should have units 1', function() {
      expect(this.range.units).to.equal(1);
    });

    it('should have measure "month"', function() {
      expect(this.range.measure).to.equal('month');
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

  describe('#getRange', function() {
    it('should return an object with a start and end value', function() {
      var range = this.range.getRange({
        startingFrom: this.date
      });
      expect(range.start).to.be.ok;
      expect(range.end).to.be.ok;
    });

    it('should return the length as a number', function() {
      var range = this.range.getRange();
      expect(typeof range.length).to.equal('number');
    });
  
    describe('whole', function() {
      it('should return the length in days', function() {
        var range;
        this.range.previous(2, 'week');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.length).to.equal(14);
      });

      it('about the previous 2 months', function() {
        var range;
        this.range.previous(2, 'month');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.format(this.format), 'start date').to.equal('01-12-2999');
        expect(range.end.format(this.format), 'end date').to.equal('31-01-3000');
      });

      it('about the previous ISO week', function() {
        var range;
        this.range.previous(1, 'isoWeek');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.isoWeekday()).to.equal(1);
        expect(range.end.isoWeekday()).to.equal(7);
        expect(range.start.date(), 'start date').to.equal(3);
        expect(range.end.date(), 'end date').to.equal(9);
      });

      it('about the previous 4 days', function() {
        var range;
        this.range.previous(4, 'day');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.day()).to.equal(6);
        expect(range.end.day()).to.equal(2);
        expect(range.start.date(), 'start date').to.equal(8);
        expect(range.end.date(), 'end date').to.equal(11);
      });
    });
  
    describe('non whole', function() {
      it('should return the length in days', function() {
        var range;
        this.range.previous(2, 'week', false);
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.length).to.equal(14);
      });

      it('about the previous 2 months', function() {
        var range;
        this.range.previous(2, 'month', false);
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.format(this.format), 'start date').to.equal('12-12-2999');
        expect(range.end.format(this.format), 'end date').to.equal('11-02-3000');
      });

      it('about the previous ISO week', function() {
        var range;
        this.range.previous(1, 'isoWeek', false);
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.isoWeekday()).to.equal(3);
        expect(range.end.isoWeekday()).to.equal(2);
        expect(range.start.date(), 'start date').to.equal(5);
        expect(range.end.date(), 'end date').to.equal(11);
      });

      it('about the previous 4 days', function() {
        var range;
        this.range.previous(4, 'day');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.day()).to.equal(6);
        expect(range.end.day()).to.equal(2);
        expect(range.start.date(), 'start date').to.equal(8);
        expect(range.end.date(), 'end date').to.equal(11);
      });
    });
  
    describe('<measure>ToDate', function() {
      it('weekToDate', function() {
        var range;
        this.range.previous(2, 'weekToDate');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.format(this.format), 'start date').to.equal('02-02-3000');
        expect(range.end.format(this.format), 'end date').to.equal('11-02-3000');
      });

      it('isoWeekToDate', function() {
        var range;
        this.range.previous(1, 'isoWeekToDate');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.format(this.format), 'start date').to.equal('10-02-3000');
        expect(range.end.format(this.format), 'end date').to.equal('11-02-3000');
      });

      it('monthToDate', function() {
        var range;
        this.range.previous(1, 'monthToDate');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.format(this.format), 'start date').to.equal('01-02-3000');
        expect(range.end.format(this.format), 'end date').to.equal('11-02-3000');
      });

      it('yearToDate', function() {
        var range;
        this.range.previous(2, 'yearToDate');
        range = this.range.getRange({
          startingFrom: this.date
        });
        expect(range.start.format(this.format), 'start date').to.equal('01-01-2999');
        expect(range.end.format(this.format), 'end date').to.equal('11-02-3000');
      });
    });
  });
});
