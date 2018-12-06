import moment from 'moment';

moment.updateLocale('es', {
  staticRange: {
    separator: 'al',
    otherYear: '%s [de] YYYY',
  },
  relativeRange: {
    past: '%d previos',
    past_week: '%d previas',
    future: 'próximos %d',
    future_week: 'próximas %d',
    current: '%d hasta la fecha',
    day: 'día',
    day_plural: '%s dias',
    week: 'semana',
    week_plural: '%s semanas',
    month: 'mes',
    month_plural: '%s meses',
    quarter: 'trimestre',
    quarter_plural: '%s trimestres',
    quarter_1: 'el próximo trimestre',
    'quarter_-1': 'el trimestre anterior',
    year: 'año',
    year_plural: '%s años',
    year_1: 'el próximo año',
    'year_-1': 'año anterior',
    r: {
      day_0: 'hoy',
      day_1: 'mañana',
      'day_-1': 'ayer',
    },
  },
});
