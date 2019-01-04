// @flow
import moment from 'moment';
import type { FormatStaticOptionsType } from './relative-range';

const REMOVE_DAY_REGEX = /([^MY]*)D([^MY,]*)/;
const REMOVE_MONTH_REGEX = /([^D.]*)(M+)([^D.]*)/;
const REMOVE_YEAR_REGEX = /([^MD.]*)YYYY([^MD.]*)/;

export type RelativeRangeInput = {
  count: number;
  measure: string;
  locale?: string;
}

export type StaticRangeInput = {
  date?: moment.Moment | string;
  start: moment.Moment;
  end: moment.Moment;
  locale?: string;
}

export const DEFAULT_STATIC_RANGE_LOCALE = {
  separator: '-',
  otherYear: '%s YYYY',
};

export const DEFAULT_RELATIVE_RANGE_LOCALE = {
  past: 'previous %d',
  future: 'next %d',
  current: 'this %d',
  day: 'day',
  day_plural: '%s days',
  week: 'week',
  week_plural: '%s weeks',
  month: 'month',
  month_plural: '%s months',
  quarter: 'quarter',
  quarter_plural: '%s quarters',
  year: 'year',
  year_plural: '%s years',
  r: {
    past: 'last %d',
    future: 'coming %d',
    current: '%d to date',
    day_0: 'today',
    day_1: 'tomorrow',
    'day_-1': 'yesterday',
  },
};

moment.updateLocale('en', {
  staticRange: {
    ...DEFAULT_STATIC_RANGE_LOCALE,
    otherYear: '%s, YYYY',
  },
  relativeRange: DEFAULT_RELATIVE_RANGE_LOCALE,
});

const cleanFormat = (format, regex, bool = true) => (bool ? format.replace(regex, '') : format);

const formatStatic = (
    range: StaticRangeInput,
    format: string = 'll',
    options: FormatStaticOptionsType = {},
) => {
  const {
      date,
      start,
      end,
      locale = moment.locale(),
    } = range;
  const localMoment = moment().locale(locale);

  const {
      separator = '-',
      otherYear: otherYearConfig = '%s YYYY',
      // eslint-disable-next-line no-underscore-dangle
  } = localMoment.localeData()._config.staticRange || DEFAULT_STATIC_RANGE_LOCALE;
  const {
      attemptYearHiding = false,
      attemptDayHiding = false,
  } = options;

  const result = [];

  const sameYear = start.year() === end.year();
  const sameMonth = sameYear && start.month() === end.month();
  const sameDay = sameMonth && start.date() === end.date();
  const isReadable = format.toLowerCase() === 'll';
  const monthsMergable = sameMonth && !sameDay && isReadable;
  const year = date ? moment(date).year() : moment().year();
  const startThisYear = start.year() === year;
  const endThisYear = end.year() === year;
  const hideDay = attemptDayHiding && isReadable &&
    start.date() === 1 && end.date() === end.daysInMonth();

  const longDateFormat = isReadable
    ? cleanFormat(localMoment.localeData().longDateFormat(format), REMOVE_DAY_REGEX, hideDay)
    : format;
  const longMonthFormat = cleanFormat(longDateFormat, REMOVE_YEAR_REGEX, isReadable);

  start.locale(locale);
  end.locale(locale);

  let startFormat;
  let endFormat;

  if (monthsMergable && !sameDay) {
    const dayFirst = longDateFormat.indexOf('D') < longDateFormat.indexOf('M');

    if (dayFirst) {
      startFormat = cleanFormat(longMonthFormat, REMOVE_MONTH_REGEX);
      endFormat = longMonthFormat;
    } else {
      startFormat = longMonthFormat;
      endFormat = cleanFormat(longMonthFormat, REMOVE_MONTH_REGEX);
    }
  } else {
    startFormat = startThisYear && sameYear && attemptYearHiding ? longMonthFormat : longDateFormat;
    endFormat = endThisYear && sameYear && attemptYearHiding ? longMonthFormat : longDateFormat;
  }

  if (startFormat.length) {
    result.push(start.format(startFormat));
  }

  if (!sameDay) {
    if (result.length) {
      result.push(separator);
    }

    if (monthsMergable && (!endThisYear || !attemptYearHiding) && endFormat !== longDateFormat) {
      endFormat = otherYearConfig.replace('%s', endFormat);
    }
    result.push(end.format(endFormat));
  }
  return result.join(' ');
};

const relativeTypeByCount = (count) => {
  switch (count) {
    case 0:
      return 'current';
    default:
      return count > 0 ? 'future' : 'past';
  }
};

const formatRelative = (
  range: RelativeRangeInput,
  format: string = 'RR',
) => {
  const {
      count,
      measure,
      locale = moment.locale(),
    } = range;
  const localMoment = moment().locale(locale);

  // eslint-disable-next-line no-underscore-dangle
  let localeData = localMoment.localeData()._config.relativeRange || DEFAULT_RELATIVE_RANGE_LOCALE;
  localeData = { ...localeData, ...localeData[format] };

  const type = relativeTypeByCount(count);

  const countKey = [measure, count].join('_');
  const countTranslation = localeData[countKey];

  if (countTranslation) {
    return countTranslation.replace('%s', Math.abs(count));
  }

  const absCount = Math.abs(count);
  const plural = absCount > 1;
  const pluralKey = plural ? `${measure}_plural` : measure;
  const translation = localeData[pluralKey] || localeData[measure] || '';

  const typePluralKey = plural ? `${type}_plural` : type;
  const typeTranslation = localeData[`${type}_${measure}`] || localeData[`${type}_${absCount}`] || localeData[typePluralKey] || localeData[type] || '';

  return typeTranslation.replace('%d', translation.replace('%s', `${absCount}`));
};

export {
    formatStatic,
    formatRelative,
};
