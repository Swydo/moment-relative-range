/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */
import moment from 'moment';
import { expect } from 'chai';
import RelativeRange from '../src/relative-range';

describe('RelativeRange#format', function () {
  const range = new RelativeRange({
    date: moment('3000-01-01'),
    type: 'current',
    units: 1,
    measure: 'day',
  });

  const translations = [{
    range: new RelativeRange({ start: '2000-01-01', end: '2000-01-01' }),
    format: 'L',
    locales: {
      en: '01/01/2000',
      nl: '01-01-2000',
      de: '01.01.2000',
    },
  }, {
    range: range.current('day'),
    format: 'L',
    locales: {
      en: '01/01/3000',
      nl: '01-01-3000',
      de: '01.01.3000',
    },
  }, {
    range: range.previous(24, 'month'),
    format: 'L',
    locales: {
      en: '01/01/2998 - 12/31/2999',
      nl: '01-01-2998 t/m 31-12-2999',
    },
  }, {
    range: range.next('month'),
    format: 'L',
    locales: {
      nl: '01-02-3000 t/m 28-02-3000',
    },
  }, {
    range: range.previous(1, 'month'),
    format: 'L',
    locales: {
      nl: '01-12-2999 t/m 31-12-2999',
      de: '01.12.2999 - 31.12.2999',
    },
  }, {
    range: range.current('day'),
    format: 'LL',
    locales: {
      en: 'January 1',
      nl: '1 januari',
      de: '1. Januar',
    },
  }, {
    range: range.previous(24, 'month'),
    format: 'LL',
    locales: {
      en: 'January 1, 2998 - December 31, 2999',
    },
  }, {
    range: range.next('month'),
    format: 'LL',
    locales: {
      nl: '1 t/m 28 februari',
      de: '1. - 28. Februar',
    },
  }, {
    range: range.previous(1, 'month'),
    format: 'LL',
    locales: {
      nl: '1 t/m 31 december 2999',
      de: '1. - 31. Dezember 2999',
    },
  }, {
    range: range.current('day'),
    format: 'll',
    locales: {
      en: 'Jan 1',
      nl: '1 jan.',
      es: '1 de ene.',
    },
  }, {
    range: range.current('day'),
    format: 'll',
    locales: {
      en: 'Jan 1, 3000',
      nl: '1 jan. 3000',
      es: '1 de ene. de 3000',
    },
    options: {
      attemptYearHiding: false,
    },
  }, {
    range: range.next(1, 'day'),
    format: 'll',
    locales: {
      en: 'Jan 2',
      nl: '2 jan.',
      es: '2 de ene.',
    },
  }, {
    range: range.previous(1, 'day'),
    format: 'll',
    locales: {
      en: 'Dec 31, 2999',
      nl: '31 dec. 2999',
      es: '31 de dic. de 2999',
    },
  }, {
    range: range.next('month'),
    format: 'll',
    locales: {
      en: 'Feb 1 - 28',
      nl: '1 t/m 28 feb.',
      es: '1 al 28 de feb.',
    },
  }, {
    range: range.next('month'),
    format: 'll',
    locales: {
      en: 'Feb 1 - 28, 3000',
      nl: '1 t/m 28 feb. 3000',
      es: '1 al 28 de feb. de 3000',
    },
    options: {
      attemptYearHiding: false,
    },
  }, {
    range: range.previous(1, 'month'),
    format: 'll',
    locales: {
      en: 'Dec 1 - 31, 2999',
      nl: '1 t/m 31 dec. 2999',
      es: '1 al 31 de dic. de 2999',
    },
  }, {
    range: range.next(1, 'month').previous(2, 'month'),
    format: 'll',
    locales: {
      en: 'Dec 1, 2999 - Jan 31, 3000',
      nl: '1 dec. 2999 t/m 31 jan. 3000',
      es: '1 de dic. de 2999 al 31 de ene. de 3000',
    },
  }, {
    range: range.previous(24, 'month'),
    format: 'll',
    locales: {
      en: 'Jan 1, 2998 - Dec 31, 2999',
      nl: '1 jan. 2998 t/m 31 dec. 2999',
      es: '1 de ene. de 2998 al 31 de dic. de 2999',
    },
  }, {
    range: range.current('day'),
    format: 'r',
    locales: {
      en: 'today',
      nl: 'vandaag',
      de: 'heute',
      es: 'hoy',
    },
  }, {
    range: range.next(1, 'day'),
    format: 'r',
    locales: {
      en: 'tomorrow',
      nl: 'morgen',
      de: 'morgen',
      es: 'mañana',
    },
  }, {
    range: range.previous(1, 'day'),
    format: 'r',
    locales: {
      en: 'yesterday',
      nl: 'gisteren',
      de: 'gestern',
      es: 'ayer',
    },
  }, {
    range: range.previous(2, 'day'),
    format: 'r',
    locales: {
      en: 'last 2 days',
      nl: 'afgelopen 2 dagen',
      de: 'letzte 2 Tage',
      es: '2 dias previos',
    },
  }, {
    range: range.next(5, 'isoWeek'),
    format: 'r',
    locales: {
      en: 'coming 5 weeks',
      nl: 'komende 5 weken',
      de: 'kommende 5 Wochen',
      es: 'próximas 5 semanas',
    },
  }, {
    range: range.previous(3, 'week'),
    format: 'r',
    locales: {
      en: 'last 3 weeks',
      nl: 'afgelopen 3 weken',
      de: 'letzte 3 Wochen',
      es: '3 semanas previas',
    },
  }, {
    range: range.current('month'),
    format: 'r',
    locales: {
      en: 'month to date',
      nl: 'maand tot nu',
      de: 'Monat bis jetzt',
      es: 'mes hasta la fecha',
    },
  }, {
    range: range.next(3, 'month'),
    format: 'r',
    locales: {
      en: 'coming 3 months',
      nl: 'komende 3 maanden',
      de: 'kommende 3 Monate',
      es: 'próximos 3 meses',
    },
  }, {
    range: range.next(1, 'quarter'),
    format: 'r',
    locales: {
      en: 'coming quarter',
      nl: 'komend kwartaal',
      de: 'kommendes Quartal',
      es: 'el próximo trimestre',
    },
  }, {
    range: range.previous(1, 'quarter'),
    format: 'r',
    locales: {
      en: 'last quarter',
      nl: 'afgelopen kwartaal',
      de: 'letztes Quartal',
      es: 'el trimestre anterior',
    },
  }, {
    range: range.previous(1, 'year'),
    format: 'r',
    locales: {
      en: 'last year',
      nl: 'afgelopen jaar',
      de: 'letztes Jahr',
      es: 'año anterior',
    },
  }, {
    range: range.next(1, 'year'),
    format: 'r',
    locales: {
      en: 'coming year',
      nl: 'komend jaar',
      de: 'kommendes Jahr',
      es: 'el próximo año',
    },
  }, {
    range: range.next(3, 'year'),
    format: 'r',
    locales: {
      en: 'coming 3 years',
      nl: 'komende 3 jaar',
      de: 'kommende 3 Jahren',
      es: 'próximos 3 años',
    },
  }, {
    range: range.current('day'),
    format: 'R',
    locales: {
      en: 'this day',
      nl: 'deze dag',
      de: 'dieser Tag',
    },
  }, {
    range: range.next(1, 'day'),
    format: 'R',
    locales: {
      en: 'next day',
      nl: 'volgende dag',
      de: 'nächstes Tag',
    },
  }, {
    range: range.previous(1, 'day'),
    format: 'R',
    locales: {
      en: 'previous day',
      nl: 'vorige dag',
      de: 'vorheriges Tag',
    },
  }, {
    range: range.previous(2, 'day'),
    format: 'R',
    locales: {
      en: 'previous 2 days',
      nl: 'vorige 2 dagen',
      de: 'vorherige 2 Tage',
    },
  }, {
    range: range.next(5, 'isoWeek'),
    format: 'R',
    locales: {
      en: 'next 5 weeks',
      nl: 'volgende 5 weken',
      de: 'nächsten 5 Wochen',
    },
  }, {
    range: range.current('month'),
    format: 'R',
    locales: {
      en: 'this month',
      nl: 'maand tot nu',
      de: 'Monat bis jetzt',
    },
  }, {
    range: range.next(3, 'month'),
    format: 'R',
    locales: {
      en: 'next 3 months',
      nl: 'volgende 3 maanden',
      de: 'nächsten 3 Monate',
    },
  }, {
    range: range.next(1, 'year'),
    format: 'R',
    locales: {
      en: 'next year',
      nl: 'volgend jaar',
      de: 'nächstes Jahr',
    },
  }, {
    range: range.next(3, 'year'),
    format: 'R',
    locales: {
      en: 'next 3 years',
      nl: 'volgende 3 jaar',
      de: 'nächsten 3 Jahren',
    },
  }];

  translations.forEach((translation) => {
    const {
        range: localeRange,
        format,
        locales,
        options,
      } = translation;

    moment.locale('en');
    const englishFormat = localeRange.format(format);

    describe(`(${format}) ${englishFormat}`, function () {
      Object.keys(locales).forEach((locale) => {
        const expectation = locales[locale];

        before(function () {
          moment.locale(locale);

          if (locale !== 'en') {
            // eslint-disable-next-line global-require, import/no-dynamic-require
            require(`../src/locale/${locale}`);
          }
        });

        after(function () {
          moment.locale('en');
        });

        it(`[${locale}]: ${expectation}${options ? ' (with options)' : ''}`, function () {
          moment.locale(locale);
          const formatted = localeRange.format(format, {
            attemptYearHiding: true,
            ...options,
          });

          expect(formatted).to.equal(expectation);
        });
      });
    });
  });
});
