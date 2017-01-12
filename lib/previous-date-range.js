'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PreviousDateRange = function () {
  _createClass(PreviousDateRange, [{
    key: 'start',
    get: function get() {
      if (this.CACHE.start) {
        return this.CACHE.start;
      }

      var start = (0, _moment2.default)(this.end);

      if (!this.whole) {
        start.subtract(this.units, this.countableMeasure);
        if (this.isToDate) {
          start.endOf(this.cleanMeasure);
        }
        start.add(1, 'day');
      } else {
        start.subtract(this.units - 1, this.countableMeasure).startOf(this.cleanMeasure);
      }

      start.startOf('day');

      this.CACHE.start = start;

      return start;
    }
  }, {
    key: 'end',
    get: function get() {
      if (this.CACHE.end) {
        return this.CACHE.end;
      }

      var end = (0, _moment2.default)(this.date);

      if (!this.whole) {
        end.subtract(this.margin, 'day');
      } else {
        end.startOf(this.cleanMeasure).subtract(this.margin, 'day').endOf(this.cleanMeasure);
      }

      end.endOf('day');

      this.CACHE.end = end;

      return end;
    }
  }, {
    key: 'length',
    get: function get() {
      return 1 + this.end.diff(this.start, 'days');
    }
  }, {
    key: 'isToDate',
    get: function get() {
      return (/ToDate$/.test(this.measure)
      );
    }
  }, {
    key: 'whole',
    get: function get() {
      return this.WHOLE != null ? this.WHOLE : !this.isToDate;
    }
  }, {
    key: 'date',
    get: function get() {
      return this.DATE;
    }
  }, {
    key: 'units',
    get: function get() {
      return this.UNITS || 1;
    }
  }, {
    key: 'margin',
    get: function get() {
      return this.MARGIN == null ? 1 : this.MARGIN;
    }
  }, {
    key: 'measure',
    get: function get() {
      return this.MEASURE || 'month';
    }
  }, {
    key: 'cleanMeasure',
    get: function get() {
      return this.measure.replace(/[s]?[ToDate]+$/, '');
    }
  }, {
    key: 'countableMeasure',
    get: function get() {
      switch (this.cleanMeasure) {
        case 'isoWeek':
          return 'week';
        default:
          return this.cleanMeasure;
      }
    }
  }]);

  function PreviousDateRange(data) {
    _classCallCheck(this, PreviousDateRange);

    this.clearCache();
    this.set(data);
  }

  _createClass(PreviousDateRange, [{
    key: 'set',
    value: function set() {
      var _this = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.constructor.attributes.filter(function (attr) {
        return data[attr] != null;
      }).forEach(function (attr) {
        _this[attr] = data[attr];
      });

      return this;
    }
  }, {
    key: 'previous',
    value: function previous(units, measure, whole) {
      return this.clone({
        units: units,
        measure: measure,
        whole: whole
      });
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.CACHE = {};
      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var json = this.toJSON();
      var allData = _extends({}, json, data);

      return new this.constructor(allData);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this2 = this;

      var json = {};

      this.constructor.attributes.filter(function (attr) {
        return _this2[attr] != null;
      }).forEach(function (attr) {
        json[attr] = _this2[attr];
      });

      return json;
    }
  }]);

  return PreviousDateRange;
}();

PreviousDateRange.attributes = ['date', 'measure', 'units', 'whole', 'margin'];

PreviousDateRange.attributes.forEach(function (attr) {
  Object.defineProperty(PreviousDateRange.prototype, attr, {
    set: function set(value) {
      this.clearCache();
      this[attr.toUpperCase()] = value;
    }
  });
});

if (_moment2.default.fn.previous == null) {
  _moment2.default.fn.previous = function previous(units, measure, whole) {
    return new PreviousDateRange({
      date: this,
      units: units,
      measure: measure,
      whole: whole
    });
  };
}

exports.default = PreviousDateRange;