chai = require 'chai'
expect = chai.expect

moment = require 'moment'

describe 'PreviousDateRange', ->

  beforeEach ->
    @format = 'DD-MM-YYYY'
    @date = new Date 3000, 1, 12

    Range = require '../previous-date-range'
    @range = new Range

  describe 'defaults', ->

    it 'should have units 1', ->
      expect @range.units
      .to.equal 1

    it 'should have measure "month"', ->
      expect @range.measure
      .to.equal 'month'

  describe '#set', ->
    it 'should set units and measure', ->
      @range.set
        measure: 'week'
        units: 2

      expect @range.measure
      .to.equal 'week'

      expect @range.units
      .to.equal 2

  describe '#previous', ->
    it 'should set units and measure', ->
      @range.previous 5, 'day'

      expect @range.units
      .to.equal 5

      expect @range.measure
      .to.equal 'day'

  describe '#getRange', ->
    it 'should return an object with a start and end value', ->
      range = @range.getRange startingFrom: @date

      expect(range.start).to.be.ok
      expect(range.end).to.be.ok

    it 'should return the length as a number', ->
      range = @range.getRange()
      expect(typeof range.length).to.equal 'number'

    describe 'whole', ->
      it 'should return the length in days', ->
        @range.previous 2, 'week'

        range = @range.getRange startingFrom: @date

        expect(range.length).to.equal 14

      it 'about the previous 2 months', ->
        @range.previous 2, 'month'

        range = @range.getRange startingFrom: @date

        expect(range.start.format(@format), 'start date').to.equal '01-12-2999'
        expect(range.end.format(@format), 'end date').to.equal '31-01-3000'

      it 'about the previous ISO week', ->
        @range.previous 1, 'isoWeek'

        range = @range.getRange startingFrom: @date

        expect(range.start.isoWeekday()).to.equal 1
        expect(range.end.isoWeekday()).to.equal 7

        expect(range.start.date(), 'start date').to.equal 3
        expect(range.end.date(), 'end date').to.equal 9

      it 'about the previous 4 days', ->
        @range.previous 4, 'day'

        range = @range.getRange startingFrom: @date

        # Day of the week
        expect(range.start.day()).to.equal 6
        expect(range.end.day()).to.equal 2

        # Date of the month
        expect(range.start.date(), 'start date').to.equal 8
        expect(range.end.date(), 'end date').to.equal 11
        
    describe 'non whole', ->
      beforeEach ->
        @range.whole = false

      it 'should return the length in days', ->
        @range.previous 2, 'week'

        range = @range.getRange startingFrom: @date

        expect(range.length).to.equal 14

      it 'about the previous 2 months', ->
        @range.previous 2, 'month'

        range = @range.getRange startingFrom: @date

        expect(range.start.format(@format), 'start date').to.equal '12-12-2999'
        expect(range.end.format(@format), 'end date').to.equal '11-02-3000'

      it 'about the previous ISO week', ->
        @range.previous 1, 'isoWeek'

        range = @range.getRange startingFrom: @date

        expect(range.start.isoWeekday()).to.equal 3
        expect(range.end.isoWeekday()).to.equal 2

        expect(range.start.date(), 'start date').to.equal 5
        expect(range.end.date(), 'end date').to.equal 11

      it 'about the previous 4 days', ->
        @range.previous 4, 'day'

        range = @range.getRange startingFrom: @date

        # Day of the week
        expect(range.start.day()).to.equal 6
        expect(range.end.day()).to.equal 2

        # Date of the month
        expect(range.start.date(), 'start date').to.equal 8
        expect(range.end.date(), 'end date').to.equal 11
