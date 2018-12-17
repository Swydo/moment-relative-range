import moment from 'moment';

moment.updateLocale('de', {
  relativeRange: {
    past: 'vorheriges %d',
    past_plural: 'vorherige %d',
    future: 'nächstes %d',
    future_plural: 'nächsten %d',
    current: '%d bis jetzt',
    day: 'Tag',
    day_plural: '%s Tage',
    week: 'Woche',
    week_plural: '%s Wochen',
    month: 'Monat',
    month_plural: '%s Monate',
    quarter: 'Quartal',
    quarter_plural: '%s Quartalen',
    year: 'Jahr',
    year_plural: '%s Jahren',
    R: {
      day_0: 'dieser Tag',
    },
    r: {
      past: 'letztes %d',
      past_plural: 'letzte %d',
      future: 'kommendes %d',
      future_plural: 'kommende %d',
      day_0: 'heute',
      day_1: 'morgen',
      'day_-1': 'gestern',
    },
  },
});
