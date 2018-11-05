import moment from 'moment';

moment.updateLocale('nl', {
  staticRange: {
    separator: 't/m',
  },
  relativeRange: {
    past: 'vorige %d',
    future: 'volgende %d',
    current: '%d tot nu',
    day: 'dag',
    day_plural: '%s dagen',
    day_0: 'deze dag',
    week: 'week',
    week_plural: '%s weken',
    month: 'maand',
    month_plural: '%s maanden',
    quarter: 'kwartaal',
    quarter_plural: '%s kwartalen',
    year: 'jaar',
    year_plural: '%s jaar',
    R: {
      quarter_1: 'volgend kwartaal',
      'quarter_-1': 'vorig kwartaal',
      year_1: 'volgend jaar',
      'year_-1': 'vorig jaar',
    },
    RR: {
      past: 'afgelopen %d',
      future: 'komende %d',
      current: '%d tot nu',
      day_0: 'vandaag',
      day_1: 'morgen',
      'day_-1': 'gisteren',
      quarter_1: 'komend kwartaal',
      year_1: 'komend jaar',
    },
  },
});
