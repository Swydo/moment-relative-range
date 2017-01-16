import moment from 'moment';

export const DAY_FORMAT = 'YYYY-MM-DD';

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z])/g, (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()));
}

function makeKey(value) {
  return `__${value.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)}`;
}

function makeAttribute(value) {
  return camelize(value).replace(/^__/, '');
}

const rangeSchema = {
  date: {
    type: Date,
  },
  measure: {
    type: String,
    default: 'month',
  },
  units: {
    type: Number,
    default: 1,
    calculate(value) {
      return this.type === 'current' ? 1 : value;
    },
  },
  type: {
    type: String,
    default: 'previous',
  },
  whole: {
    type: Boolean,
  },
  margin: {
    type: Number,
    default: 1,
  },
  fixedStart: {
    type: String,
  },
};

class PreviousDateRange {
  get start() {
    const end = this.end;
    let start = moment(end);

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

    if (this.fixedStart) {
      start = moment.max(start, moment(this.fixedStart));
      start = moment.min(end, start);
    }

    return start;
  }

  get end() {
    const end = moment(this.date);

    if (this.whole) {
      end
        .subtract(this.margin - 1, 'day')
        .startOf(this.cleanMeasure)
        .subtract(1, 'day')
        .endOf(this.cleanMeasure);
    } else {
      end.subtract(this.margin, 'day');
    }

    return end.endOf('day');
  }

  get length() { return 1 + this.end.diff(this.start, 'days'); }

  get isToDate() { return this.type === 'current'; }

  // Days are always whole days.
  // If something is `<measure>ToDate`, then it isn't whole by default.
  // Can be manually overruled for things that aren't a day.
  get whole() {
    const whole = this[makeKey('whole')];
    return this.cleanMeasure === 'day' || whole != null ? whole : !this.isToDate;
  }

  get cleanMeasure() { return this.measure.replace(/s$/, ''); }

  get countableMeasure() {
    switch (this.cleanMeasure) {
      case 'isoWeek':
        return 'week';
      default:
        return this.cleanMeasure;
    }
  }

  constructor(data) {
    this.set(data);
  }

  set(data = {}) {
    Object.keys(rangeSchema)
      .filter(attr => data[attr] != null)
      .forEach((attr) => {
        this[attr] = data[attr];
      });

    return this;
  }

  previous(units, measure, whole) {
    return this.clone({
      units,
      measure,
      whole,
    });
  }

  clone(data = {}) {
    const json = this.toJSON({ skipGetters: true });
    const allData = { ...json, ...data };

    return new this.constructor(allData);
  }

  toJSON({
    attributes = Object.keys(rangeSchema),
    skipGetters = false,
  } = {}) {
    const json = {};

    attributes
      .map(attr => (skipGetters ? makeKey(attr) : attr))
      .filter(attr => this[attr] != null)
      .forEach((attr) => {
        json[makeAttribute(attr)] = this[attr];
      });

    return json;
  }
}

Object.keys(rangeSchema).forEach((attr) => {
  const settings = rangeSchema[attr];
  const key = makeKey(attr);
  const descriptor = Object.getOwnPropertyDescriptor(PreviousDateRange.prototype, attr);

  const property = {};

  if (!descriptor || !descriptor.get) {
    property.get = function get() {
      const value = this[key] != null ? this[key] : settings.default;
      return settings.calculate ? settings.calculate.call(this, value) : value;
    };
  }

  property.set = function set(value) {
    this[key] = value;
  };

  Object.defineProperty(PreviousDateRange.prototype, attr, property);
});

moment.fn.previous = function previous(units, measure, whole) {
  return new PreviousDateRange({
    date: this,
    type: 'previous',
    units,
    measure,
    whole,
  });
};

moment.fn.current = function current(measure, whole) {
  return new PreviousDateRange({
    date: this,
    type: 'current',
    measure,
    whole,
  });
};

export default PreviousDateRange;
