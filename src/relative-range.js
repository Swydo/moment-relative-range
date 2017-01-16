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
    enum: ['previous', 'current'],
  },
  whole: {
    type: Boolean,
  },
  margin: {
    type: Number,
    default: 1,
  },
  start: {
    type: Date,
    inJSON: false,
  },
  end: {
    type: Date,
    inJSON: false,
  },
  minimumStart: {
    type: Date,
  },
};

function isDateType(Type) {
  return Object.prototype.toString.call(new Type()) === '[object Date]';
}

const jsonAttributes = Object.keys(rangeSchema)
  .filter(attr => rangeSchema[attr] && rangeSchema[attr].inJSON !== false);

class RelativeRange {
  get start() {
    const end = this.end;
    const { __start: fixedStart } = this;

    if (fixedStart) {
      return moment.min(fixedStart, end);
    }

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

    if (this.minimumStart) {
      start = moment.max(start, moment(this.minimumStart));
      start = moment.min(end, start);
    }

    return start;
  }

  get end() {
    const end = moment(this.date);

    const { __end: fixedEnd } = this;

    if (fixedEnd) {
      return moment.min(fixedEnd, end);
    }

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

  lock(part) {
    if (part) {
      this[part] = this[part];
    } else {
      this.start = this.start;
      this.end = this.end;
    }
    return this;
  }

  unlock(part) {
    if (part) {
      this[part] = null;
    } else {
      this.start = null;
      this.end = null;
    }
    return this;
  }

  isLocked(part) {
    const parts = part ? [`__${part}`] : ['__start', '__end'];

    return parts.every(key => this[key]);
  }

  clone(data = {}) {
    const json = this.toJSON({ defaults: false });
    const allData = { ...json, ...data };

    return new this.constructor(allData);
  }

  toJSON({
    attributes = jsonAttributes,
    defaults = true,
    format = DAY_FORMAT,
  } = {}) {
    const json = {};

    attributes
      .map(attr => (!defaults ? makeKey(attr) : attr))
      .filter(attr => this[attr] != null)
      .forEach((attr) => {
        const attrName = makeAttribute(attr);
        const schema = rangeSchema[attrName];

        if (schema.inJSON === false && !this[makeKey(attr)]) {
          return;
        }

        if (isDateType(schema.type)) {
          json[attrName] = this[attr] && moment(this[attr]).format(format);
        } else {
          json[attrName] = this[attr];
        }
      });

    return json;
  }

  toArray(format = DAY_FORMAT) {
    return [this.start.format(format), this.end.format(format)];
  }
}

Object.keys(rangeSchema).forEach((attr) => {
  const settings = rangeSchema[attr];
  const key = makeKey(attr);
  const descriptor = Object.getOwnPropertyDescriptor(RelativeRange.prototype, attr);

  const property = {};

  if (!descriptor || !descriptor.get) {
    property.get = function get() {
      const value = this[key] != null ? this[key] : settings.default;
      return settings.calculate ? settings.calculate.call(this, value) : value;
    };
  }

  property.set = function set(value) {
    const schema = rangeSchema[attr];

    if (schema.enum && value != null && !schema.enum.includes(value)) {
      throw new Error(`${value} isn't an allowed value for RelativeRange.${attr}`);
    }

    if (isDateType(schema.type)) {
      this[key] = value == null ? value : moment(value);
    } else {
      this[key] = value;
    }
  };

  Object.defineProperty(RelativeRange.prototype, attr, property);
});

export function extendMoment(m) {
  // eslint-disable-next-line no-param-reassign
  m.fn.previous = function previous(units, measure, whole) {
    return new RelativeRange({
      date: this,
      type: 'previous',
      units,
      measure,
      whole,
    });
  };

  // eslint-disable-next-line no-param-reassign
  m.fn.current = function current(measure, whole) {
    return new RelativeRange({
      date: this,
      type: 'current',
      measure,
      whole,
    });
  };
}

export default RelativeRange;
