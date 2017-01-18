// @flow weak
import moment from 'moment';

export const DAY_FORMAT = 'YYYY-MM-DD';

function isDateType(Type): boolean {
  return Object.prototype.toString.call(new Type()) === '[object Date]';
}

function makeMomentOrNull(value: any): moment.Moment | null {
  return value ? moment(value) : value;
}

const rangeTypes = {
  previous: 'previous',
  current: 'current',
};

const rangeParts = {
  start: 'start',
  end: 'end',
};

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
    calculate(value?: ?number): number | void | null {
      return this.type === rangeTypes.current ? 1 : value;
    },
  },
  type: {
    type: String,
    default: rangeTypes.previous,
    enum: Object.keys(rangeTypes),
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

type RangeSchemaType = {
  type: mixed;
  default?: number | string;
  inJSON?: boolean;
  enum?: string[];
  calculate?: (value: any) => mixed;
}

type RangePartEnum = $Keys<typeof rangeParts>;
type RangeTypeEnum = $Keys<typeof rangeTypes>;
type RangeAttributeEnum = $Keys<typeof rangeSchema>;

export type RelativeRangeOptionsType = {
  units?: number;
  measure?: string;
  type?: RangeTypeEnum;
  whole?: boolean;
  margin?: number;
  date?: moment.Moment | string | Date;
  start?: moment.Moment;
  end?: moment.Moment;
  minimumStart?: moment.Moment;
}

export type RelativeRangeJsonOptionsType = {
  attributes?: RangeAttributeEnum[];
  defaults?: boolean;
  format?: string;
}

class RelativeRange {

  units: number;
  measure: string;
  type: RangeTypeEnum;
  whole: boolean;
  margin: number;
  start: moment.Moment;
  end: moment.Moment;
  date: moment.Moment | string;
  minimumStart: moment.Moment;

  data: RelativeRangeOptionsType;

  get start(): moment.Moment {
    const end = this.end;

    if (this.data.start) {
      return moment.min(this.data.start, end);
    }

    let start = moment(end);

    if (!this.isWhole()) {
      start.subtract(this.units, this.countableMeasure);
      if (this.isToDate()) {
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

  get end(): moment.Moment {
    const end = moment(this.date);

    if (this.data.end) {
      return moment.min(this.data.end, end);
    }

    if (this.isWhole()) {
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

  set start(value: string | moment.Moment | Date): void {
    this.data.start = makeMomentOrNull(value);
  }

  set end(value: string | moment.Moment | Date): void {
    this.data.end = makeMomentOrNull(value);
  }
  // set date(value: string | moment.Moment | Date): void { this.__date = makeMomentOrNull(value); }

  // get date(): moment.Moment { return this.__date; }

  get length(): number { return 1 + this.end.diff(this.start, 'days'); }

  isToDate(): boolean { return this.type === 'current'; }

  // Days are always whole days.
  // If something is `current`, then it isn't whole by default.
  // Can be manually overruled for things that aren't a day.
  isWhole(): boolean {
    const whole = this.data.whole;
    return this.cleanMeasure === 'day' || (whole != null ? whole : !this.isToDate());
  }

  get cleanMeasure(): string { return this.measure.replace(/s$/, ''); }

  get countableMeasure(): string {
    switch (this.cleanMeasure) {
      case 'isoWeek':
        return 'week';
      default:
        return this.cleanMeasure;
    }
  }

  constructor(data: RelativeRangeOptionsType = {}) {
    this.data = {};
    this.set(data);
  }

  set(data: RelativeRangeOptionsType = {}): this {
    this.data = { ...this.data, ...data };

    return this;
  }

  previous(units: number, measure: string, whole?: boolean): RelativeRange {
    return new this.constructor({
      date: this.start,
      type: 'previous',
      units,
      measure,
      whole,
    });
  }

  lock(part?: RangePartEnum): this {
    if (part) {
      (this: Object)[part] = (this: Object)[part];
    } else {
      this.data.start = this.start;
      this.data.end = this.end;
    }
    return this;
  }

  unlock(part?: RangePartEnum): this {
    if (part) {
      (this: Object)[part] = null;
    } else {
      this.start = null;
      this.end = null;
    }
    return this;
  }

  isLocked(part?: RangePartEnum): boolean {
    const parts: RangePartEnum[] = part ? [part] : ['start', 'end'];

    return parts.every((key: RangePartEnum) => this.data[key]);
  }

  toJSON({
    format = DAY_FORMAT,
    defaults = true,
  }: RelativeRangeJsonOptionsType = {}): RelativeRangeOptionsType {
    const json: Object = {};

    const data = defaults ? this : this.data;

    Object.keys(rangeSchema)
      .filter((attr: RangeAttributeEnum) => (data: Object)[attr] != null)
      .forEach((attr: RangeAttributeEnum) => {
        const schema: RangeSchemaType = rangeSchema[attr];

        if (isDateType(schema.type)) {
          json[attr] = (data: Object)[attr] && moment((this: Object)[attr]).format(format);
        } else {
          json[attr] = (data: Object)[attr];
        }
      });

    return json;
  }

  toArray(format = DAY_FORMAT): string[] {
    return [this.start.format(format), this.end.format(format)];
  }
}

Object.keys(rangeSchema).forEach((attr) => {
  const settings = rangeSchema[attr];
  const descriptor = Object.getOwnPropertyDescriptor(RelativeRange.prototype, attr);

  const property = {};

  if (!descriptor || !descriptor.get) {
    property.get = function get() {
      const value = this.data[attr] != null ? this.data[attr] : settings.default;
      return settings.calculate ? settings.calculate.call(this, value) : value;
    };
  }

  if (!descriptor || !descriptor.set) {
    property.set = function set(value) {
      const schema = rangeSchema[attr];

      if (schema.enum && value != null && !schema.enum.includes(value)) {
        throw new Error(`${value} isn't an allowed value for RelativeRange.${attr}`);
      }

      if (isDateType(schema.type)) {
        this.data[attr] = value == null ? value : moment(value);
      } else {
        this.data[attr] = value;
      }
    };
  }

  if (Object.keys(property).length) {
    Object.defineProperty(RelativeRange.prototype, attr, property);
  }
});

export function extendMoment(m) {
  // eslint-disable-next-line no-param-reassign
  m.fn.previous = function previous(
    units: number,
    measure: string,
    whole?: boolean,
  ): RelativeRange {
    return new RelativeRange({
      date: this,
      type: rangeTypes.previous,
      units,
      measure,
      whole,
    });
  };

  // eslint-disable-next-line no-param-reassign
  m.fn.current = function current(
    measure: string,
    whole?: boolean,
  ): RelativeRange {
    return new RelativeRange({
      date: this,
      type: rangeTypes.current,
      measure,
      whole,
    });
  };
}

export default RelativeRange;
