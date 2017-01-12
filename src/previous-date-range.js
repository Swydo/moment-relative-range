import moment from 'moment';

class PreviousDateRange {
  get start() {
    if (this.CACHE.start) { return this.CACHE.start; }

    const start = moment(this.end);

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

  get end() {
    if (this.CACHE.end) { return this.CACHE.end; }

    const end = moment(this.date);

    if (!this.whole) {
      end.subtract(this.margin, 'day');
    } else {
      end.startOf(this.cleanMeasure)
        .subtract(this.margin, 'day')
        .endOf(this.cleanMeasure);
    }

    end.endOf('day');

    this.CACHE.end = end;

    return end;
  }

  get length() { return 1 + this.end.diff(this.start, 'days'); }

  get isToDate() { return /ToDate$/.test(this.measure); }

  get whole() { return this.WHOLE != null ? this.WHOLE : !this.isToDate; }
  set whole(val) {
    this.clearCache();
    this.WHOLE = val;
  }

  get date() { return this.DATE; }
  set date(val) {
    this.clearCache();
    this.DATE = moment(val);
  }

  get units() { return this.UNITS || 1; }
  set units(val) {
    this.clearCache();
    this.UNITS = val;
  }

  get measure() { return this.MEASURE || 'month'; }
  set measure(val) {
    this.clearCache();
    this.MEASURE = val;
  }

  get cleanMeasure() {
    return this.measure.replace(/[s]?[ToDate]+$/, '');
  }

  get countableMeasure() {
    switch (this.cleanMeasure) {
      case 'isoWeek':
        return 'week';
      default:
        return this.cleanMeasure;
    }
  }

  get margin() { return this.MARGIN == null ? 1 : this.MARGIN; }
  set margin(val) {
    this.clearCache();
    this.MARGIN = val;
  }

  constructor(data) {
    this.clearCache();
    this.set(data);
  }

  set(data = {}) {
    this.constructor.attributes
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

  clearCache() {
    this.CACHE = {};
    return this;
  }

  clone(data = {}) {
    const json = this.toJSON();
    const allData = { ...json, ...data };

    return new this.constructor(allData);
  }

  toJSON() {
    const json = {};

    this.constructor.attributes
      .filter(attr => this[attr] != null)
      .forEach((attr) => {
        json[attr] = this[attr];
      });

    return json;
  }
}

PreviousDateRange.attributes = ['date', 'measure', 'units', 'whole'];

if (moment.fn.previous == null) {
  moment.fn.previous = function previous(units, measure, whole) {
    return new PreviousDateRange({
      date: this,
      units,
      measure,
      whole,
    });
  };
}

export default PreviousDateRange;
