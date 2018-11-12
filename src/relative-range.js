// @flow
import moment from 'moment';
import { formatRelative, formatStatic } from './format';

export const DAY_FORMAT = 'YYYY-MM-DD';

type RangeSchemaTypeEnum = typeof Date | typeof String | typeof Number | typeof Boolean;

export type FormatStaticOptionsType = {
    attemptYearHiding?: boolean;
}

function isDateType(Type: RangeSchemaTypeEnum): boolean {
  return Object.prototype.toString.call(new Type()) === '[object Date]';
}

function makeMomentOrNull(value: any): moment.Moment | null {
  return value ? moment(value) : value;
}

export const RANGE_TYPES = Object.freeze({
  previous: 'previous',
  current: 'current',
  next: 'next',
});

export const RANGE_PARTS = Object.freeze({
  start: 'start',
  end: 'end',
});

export const RANGE_MEASURES = Object.freeze({
  day: 'day',
  days: 'day',
  week: 'week',
  weeks: 'week',
  isoWeek: 'isoWeek',
  isoWeeks: 'isoWeek',
  month: 'month',
  months: 'month',
  quarter: 'quarter',
  quarters: 'quarter',
  year: 'year',
  years: 'year',
});

const rangeSchema = {
  date: {
    type: Date,
  },
  measure: {
    type: String,
    default: RANGE_MEASURES.month,
    enum: Object.keys(RANGE_MEASURES),
  },
  units: {
    type: Number,
    default: 1,
    calculate(value?: ?number): number | void | null {
      return this.type === RANGE_TYPES.current ? 1 : value;
    },
  },
  type: {
    type: String,
    default: RANGE_TYPES.previous,
    enum: Object.keys(RANGE_TYPES),
  },
  whole: {
    type: Boolean,
  },
  margin: {
    type: Number,
    calculate(value?: ?number): number | void | null {
      const defaultValue = this.type === RANGE_TYPES.current ? 0 : 1;

      return value !== undefined ? value : defaultValue;
    },
  },
  start: {
    type: Date,
  },
  end: {
    type: Date,
  },
  minimumStart: {
    type: Date,
  },
};

type RangeSchemaType = {
  type: RangeSchemaTypeEnum;
  default?: number | string;
  enum?: string[];
  calculate?: (value: any) => mixed;
}

type RangePartEnum = $Keys<typeof RANGE_PARTS>;
type RangeTypeEnum = $Keys<typeof RANGE_TYPES>;
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
      return moment.min(moment(this.data.start), end);
    }

    let start = moment(end);

    if (!this.isWhole()) {
      start.subtract(this.units, this.countableMeasure);
      if (this.isToDate()) {
        start.endOf(this.cleanMeasure);
      }
      start.add(1, RANGE_MEASURES.day);
    } else {
      start.subtract(this.units - 1, this.countableMeasure).startOf(this.cleanMeasure);
    }

    start.startOf(RANGE_MEASURES.day);

    if (this.minimumStart) {
      start = moment.max(start, moment(this.minimumStart));
      start = moment.min(end, start);
    }

    return start;
  }

  get end(): moment.Moment {
    const end = moment(this.date);

    if (this.data.end) {
      return moment.min(moment(this.data.end), end);
    }

    let change;
    let move;

    switch (this.type) {
      case RANGE_TYPES.next:
        change = 'add';
        move = 'endOf';
        break;
      default:
        change = 'subtract';
        move = 'startOf';
    }

    if (this.isWhole()) {
      end[change](
        this.margin - 1, RANGE_MEASURES.day,
      )[move](
        this.cleanMeasure,
      )[change](
        1, RANGE_MEASURES.day,
      )
      .endOf(this.cleanMeasure);
    } else {
      end[change](this.margin, RANGE_MEASURES.day);
    }

    return end.endOf(RANGE_MEASURES.day);
  }

  set start(value: string | moment.Moment | Date): void {
    this.data.start = makeMomentOrNull(value);
  }

  set end(value: string | moment.Moment | Date): void {
    this.data.end = makeMomentOrNull(value);
  }
  // set date(value: string | moment.Moment | Date): void { this.__date = makeMomentOrNull(value); }

  // get date(): moment.Moment { return this.__date; }

  get length(): number { return 1 + this.end.diff(this.start, RANGE_MEASURES.days); }

  isToDate(): boolean { return this.type === RANGE_TYPES.current; }

  get count(): number {
    switch (this.type) {
      case RANGE_TYPES.current:
        return 0;
      case RANGE_TYPES.previous:
        return this.units * -1;
      case RANGE_TYPES.next:
      default:
        return this.units;
    }
  }

  // Days are always whole days.
  // If something is `current`, then it isn't whole by default.
  // Can be manually overruled for things that aren't a day.
  isWhole(): boolean {
    const whole = this.data.whole;
    return this.cleanMeasure === RANGE_MEASURES.day || (whole != null ? whole : !this.isToDate());
  }

  get cleanMeasure(): string { return RANGE_MEASURES[this.measure]; }

  get countableMeasure(): string {
    switch (this.cleanMeasure) {
      case RANGE_MEASURES.isoWeek:
        return RANGE_MEASURES.week;
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
      type: RANGE_TYPES.previous,
      units,
      measure,
      whole,
    });
  }

  current(measure: string, whole?: boolean): RelativeRange {
    return new this.constructor({
      date: this.end,
      type: RANGE_TYPES.current,
      units: 1,
      measure,
      whole,
    });
  }

  next(units: number, measure: string, whole?: boolean): RelativeRange {
    return new this.constructor({
      date: this.end,
      type: RANGE_TYPES.next,
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
    const parts: RangePartEnum[] = part ? [part] : Object.keys(RANGE_PARTS);

    return parts.every((key: RangePartEnum) => this.data[key]);
  }

  format(format?: string, options?: FormatStaticOptionsType): string {
    switch (format) {
      case 'R':
      case 'RR':
        return formatRelative(this, format);
      default:
        return formatStatic(this, format, options);
    }
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

  toArray(format?: string = DAY_FORMAT): string[] {
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

      if (schema.enum && value != null && schema.enum.indexOf(value) === -1) {
        throw new Error(`${value} isn't an allowed value for RelativeRange.${attr}`);
      }

      if (isDateType(schema.type)) {
        this.data[attr] = makeMomentOrNull(value);
      } else {
        this.data[attr] = value;
      }
    };
  }

  if (Object.keys(property).length) {
    Object.defineProperty(RelativeRange.prototype, attr, property);
  }
});

export function extendMoment(m: moment) {
  // eslint-disable-next-line no-param-reassign
  m.fn.previous = function previous(
    units: number,
    measure: string,
    whole?: boolean,
  ): RelativeRange {
    return new RelativeRange({
      date: this,
      type: RANGE_TYPES.previous,
      units,
      measure,
      whole,
    });
  };

  // eslint-disable-next-line no-param-reassign
  m.fn.next = function next(
    units: number,
    measure: string,
    whole?: boolean,
  ): RelativeRange {
    return new RelativeRange({
      date: this,
      type: RANGE_TYPES.next,
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
      type: RANGE_TYPES.current,
      measure,
      whole,
    });
  };
}

export default RelativeRange;
