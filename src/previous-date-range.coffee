moment = @moment or require 'moment'

class PreviousDateRange

  @attributes: ['date', 'measure', 'units', 'whole']

  constructor: (data) ->
    @clearCache()
    @set data

  set: (data = {}) ->
    for attr in @constructor.attributes when data[attr]?
      @[attr] = data[attr]
    this

  previous: (@units, @measure, whole) ->
    if whole? then @whole = whole
    this

  clearCache: ->
    @_cache = {}

  getRange: (options = {}) ->
    console.warn('DEPRECATED: call .end, .start and .length directly on the range object')

    if options.startingFrom
      console.warn('DEPRECATED: set .date directly on the range object')
      @date = options.startingFrom

    this

  toJSON: ->
    @constructor.attributes.reduce (json, attr) =>
      json[attr] = @[attr] if @[attr]?
      json
    , {}

Object.defineProperty PreviousDateRange.prototype, 'units',
  get: -> @_units or 1
  set: (val) ->
    @clearCache()
    @_units = val

Object.defineProperty PreviousDateRange.prototype, 'measure',
  get: -> @_measure or 'month'
  set: (val) ->
    @clearCache()
    @_measure = val

Object.defineProperty PreviousDateRange.prototype, 'toDate',
  get: -> /ToDate$/.test @measure

Object.defineProperty PreviousDateRange.prototype, "cleanMeasure",
  get: -> @measure.replace(/[s]?[ToDate]+$/, '')

Object.defineProperty PreviousDateRange.prototype, "countableMeasure",
  get: ->
    switch @cleanMeasure
      when 'isoWeek'
        'week'
      else
        @cleanMeasure

Object.defineProperty PreviousDateRange.prototype, 'whole',
  get: -> if @_whole? then @_whole else not @toDate
  set: (val) ->
    @clearCache()
    @_whole = val

Object.defineProperty PreviousDateRange.prototype, 'date',
  get: -> @_date
  set: (val) ->
    @clearCache()
    @_date = val

Object.defineProperty PreviousDateRange.prototype, 'end',
  get: ->
    if @_cache.end
      return @_cache.end

    end = moment(@date)

    if not @whole
      end
        .subtract 1, 'day'
    else
      end
        .startOf @cleanMeasure
        .subtract 1, 'day'
        .endOf @cleanMeasure

     end.endOf 'day'

     @_cache.end = end

Object.defineProperty PreviousDateRange.prototype, 'start',
  get: ->
    if @_cache.start
      return @_cache.start

    start = moment @end
    
    if not @whole
      start.subtract @units, @countableMeasure

      if @toDate
        start.endOf @cleanMeasure

      start
        .add 1, 'day'
    else
      start
        .subtract @units-1, @countableMeasure
        .startOf @cleanMeasure

    start.startOf 'day'

    @_cache.start = start

Object.defineProperty PreviousDateRange.prototype, 'length',
  get: -> 1 + @end.diff @start, 'days'

moment.fn.previous ?= (units, measure, whole) ->
  new PreviousDateRange
    date: @clone()
    units: units
    measure: measure
    whole: whole

if module?.exports?
  module.exports = PreviousDateRange
else
  @PreviousDateRange = PreviousDateRange
