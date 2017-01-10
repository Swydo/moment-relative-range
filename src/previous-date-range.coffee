moment = @moment or require 'moment'

class PreviousDateRange

  @attributes: ['measure', 'units', 'whole']

  constructor: (data) ->
    @set data
    @setDefaults()

  set: (data = {}) ->
    for attr in @constructor.attributes when data[attr]?
      @[attr] = data[attr]
    this

  setDefaults: ->
    @measure ?= 'month'
    @units ?= 1
    @toDate = /ToDate$/.test @measure
    @whole = not @toDate

  previous: (@units, @measure, whole) ->
    @setDefaults()

    if whole?
      @whole = whole

  getRange: (options = {}) ->
    end = @getEnd options.startingFrom
    start = @getStart end
    length = 1 + end.diff start, 'days'

    start: start
    end: end
    length: length

  getEnd: (fromDate) ->
    end = moment fromDate

    if not @whole
      end
        .subtract 1, 'day'
    else
      end
        .startOf @getCleanMeasure()
        .subtract 1, 'day'
        .endOf @getCleanMeasure()

  getStart: (compareToDate) ->
    end = moment compareToDate
    
    if not @whole
      end.subtract @units, @getCountableMeasure()

      if @toDate
        end.endOf @getCleanMeasure()

      end.add 1, 'day'
    else
      end
        .subtract @units-1, @getCountableMeasure()
        .startOf @getCleanMeasure()

  getCleanMeasure: ->
    @measure.replace('ToDate', '')

  getCountableMeasure: ->
    cleanMeasure = @getCleanMeasure()

    switch cleanMeasure
      when 'isoWeek'
        'week'
      else
        cleanMeasure

  toJSON: ->
    json = {}
    for attr in @constructor.attributes when @[attr]?
      json[attr] = @[attr]
    json

if module?.exports?
  module.exports = PreviousDateRange
else
  @PreviousDateRange = PreviousDateRange
