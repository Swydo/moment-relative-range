moment = @moment or require 'moment'

class PreviousDateRange

  @attributes: ['measure', 'units', 'whole']

  constructor: (data) ->
    @set data

  set: (data = {}) ->
    for attr in @constructor.attributes when data[attr]?
      @[attr] = data[attr]
    this

  previous: (@units, @measure, whole) ->
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
        .startOf @cleanMeasure
        .subtract 1, 'day'
        .endOf @cleanMeasure

  getStart: (compareToDate) ->
    end = moment compareToDate
    
    if not @whole
      end.subtract @units, @countableMeasure

      if @toDate
        end.endOf @cleanMeasure

      end.add 1, 'day'
    else
      end
        .subtract @units-1, @countableMeasure
        .startOf @cleanMeasure

  toJSON: ->
    json = {}
    for attr in @constructor.attributes when @[attr]?
      json[attr] = @[attr]
    json

# Use getters and setters to add default values and update `toDate` value

Object.defineProperty PreviousDateRange.prototype, 'units',
  get: -> @_units or 1
  set: (val) -> @_units = val

Object.defineProperty PreviousDateRange.prototype, 'measure',
  get: -> @_measure or 'month'
  set: (val) ->
    @_measure = val
    @toDate = /ToDate$/.test @measure
    @whole = not @toDate

Object.defineProperty PreviousDateRange.prototype, "cleanMeasure",
  get: -> @measure.replace('ToDate', '')

Object.defineProperty PreviousDateRange.prototype, "countableMeasure",
  get: ->
    switch @cleanMeasure
      when 'isoWeek'
        'week'
      else
        @cleanMeasure

if module?.exports?
  module.exports = PreviousDateRange
else
  @PreviousDateRange = PreviousDateRange
