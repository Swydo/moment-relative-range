// @flow
import moment from 'moment';
import RelativeRange from './relative-range';
import type { FormatStaticOptionsType } from './relative-range';

export const DEFAULT_STATIC_RANGE_LOCALE = {
  separator: '-',
  otherYear: '%s, YYYY',
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
  RR: {
    past: 'last %d',
    future: 'coming %d',
    current: '%d to date',
    day_0: 'today',
    day_1: 'tomorrow',
    'day_-1': 'yesterday',
  },
};

moment.updateLocale('en', {
  staticRange: DEFAULT_STATIC_RANGE_LOCALE,
  relativeRange: DEFAULT_RELATIVE_RANGE_LOCALE,
});

const formatStatic = (
    range: RelativeRange,
    format: string = 'll',
    options: FormatStaticOptionsType = {},
) => {
  const {
      date,
      start,
      end,
    } = range;
  const {
      separator = '-',
      otherYear: otherYearConfig = '%s YYYY',
      // eslint-disable-next-line no-underscore-dangle
    } = moment.localeData()._config.staticRange || DEFAULT_STATIC_RANGE_LOCALE;
  const {
      attemptYearHiding = true,
  } = options;

  const result = [];

  const sameYear = start.year() === end.year();
  const sameMonth = sameYear && start.month() === end.month();
  const sameDay = sameMonth && start.date() === end.date();
  const isReadable = format.toLowerCase() === 'll';
  const monthsMergable = sameMonth && !sameDay && isReadable;
  const longDateFormat = moment.localeData().longDateFormat(format);
  const longMonthFormat = isReadable ? longDateFormat.replace(/([^MD.]*)YYYY([^MD.]*)/, '') : longDateFormat;
  const year = date ? moment(date).year() : moment().year();
  const startThisYear = start.year() === year;
  const endThisYear = end.year() === year;

  start.locale(moment.locale());
  end.locale(moment.locale());

  let startFormat;
  let endFormat;

  if (monthsMergable && !sameDay) {
    const dayFirst = longDateFormat.indexOf('D') < longDateFormat.indexOf('M');

    if (dayFirst) {
      startFormat = longMonthFormat.replace(/([^D.]*)(M+)([^D.]*)/, '');
      endFormat = longMonthFormat;
    } else {
      startFormat = longMonthFormat;
      endFormat = longMonthFormat.replace(/([^D.]*)(M+)([^D.]*)/, '');
    }
  } else {
    startFormat = startThisYear && sameYear && attemptYearHiding ? longMonthFormat : longDateFormat;
    endFormat = endThisYear && sameYear && attemptYearHiding ? longMonthFormat : longDateFormat;
  }

  result.push(start.format(startFormat));

  if (!sameDay) {
    result.push(separator);

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

const formatRelative = (range: RelativeRange, format: string = 'RR') => {
  const {
      count,
      countableMeasure: measure,
    } = range;

  // eslint-disable-next-line no-underscore-dangle
  let locale = moment.localeData()._config.relativeRange || DEFAULT_RELATIVE_RANGE_LOCALE;
  locale = { ...locale, ...locale[format] };

  const type = relativeTypeByCount(count);

  const countKey = [measure, count].join('_');
  const countTranslation = locale[countKey];

  if (countTranslation) {
    return countTranslation.replace('%s', Math.abs(count));
  }

  const absCount = Math.abs(count);
  const plural = absCount > 1;
  const pluralKey = plural ? `${measure}_plural` : measure;
  const translation = locale[pluralKey] || locale[measure] || '';

  const typePluralKey = plural ? `${type}_plural` : type;
  const typeTranslation = locale[`${type}_${measure}`] || locale[`${type}_${absCount}`] || locale[typePluralKey] || locale[type] || '';

  return typeTranslation.replace('%d', translation.replace('%s', absCount));
};

export {
    formatStatic,
    formatRelative,
};
