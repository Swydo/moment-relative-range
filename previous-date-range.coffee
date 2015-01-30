moment = @moment or require 'moment'

class PreviousDateRange

  @attributes: ['measure', 'units']

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

  previous: (@units, @measure) ->

  getRange: (options = {}) ->
    end = @getEnd options.startingFrom
    start = @getStart end
    length = 1 + end.diff start, 'days'

    start: start
    end: end
    length: length

  getEnd: (fromDate) ->
    moment fromDate
    .startOf @measure
    .subtract 1, 'day'
    .endOf @measure

  getStart: (compareToDate) ->
    moment compareToDate
    .subtract @units-1, @getCountableMeasure()
    .startOf @measure

  getCountableMeasure: ->
    if @measure is 'isoWeek' then 'week' else @measure

  toJSON: ->
    json = {}
    for attr in @constructor.attributes when @[attr]?
      json[attr] = @[attr]
    json

module.exports = PreviousDateRange
