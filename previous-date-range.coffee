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
    @whole ?= true

  previous: (@units, @measure, whole) ->
    if whole?
      @whole = whole

    @setDefaults()

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
        .startOf @measure
        .subtract 1, 'day'
        .endOf @measure

  getStart: (compareToDate) ->
    end = moment compareToDate
    
    if not @whole
      end
        .subtract @units, @getCountableMeasure()
        .add 1, 'day'
    else
      end
        .subtract @units-1, @getCountableMeasure()
        .startOf @measure

  getCountableMeasure: ->
    if @measure is 'isoWeek' then 'week' else @measure

  toJSON: ->
    json = {}
    for attr in @constructor.attributes when @[attr]?
      json[attr] = @[attr]
    json

if module?.exports?
  module.exports = PreviousDateRange
else
  @PreviousDateRange = PreviousDateRange
