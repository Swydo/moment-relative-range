previous-date-range
===================

Calculate a date range in the past from a certain moment

[![Build status](https://api.travis-ci.org/jamiter/previous-date-range.png)](https://travis-ci.org/jamiter/previous-date-range)
[![Coverage Status](https://coveralls.io/repos/github/jamiter/previous-date-range/badge.svg)](https://coveralls.io/github/jamiter/previous-date-range)

## Installation

### npm
```bash
npm i -S previous-date-range
```

### yarn
```bash
yarn add previous-date-range
```

## Basic usage

You can use `moment().previous(units, measure)`:

```js
import moment from 'moment';
import 'previous-date-range';

var range = moment().previous(5, 'days');

// range.start = 6 days ago
// range.end = yesterday
// range.length = 5

var clone = range.previous(1, 'months');

// clone.start = start of 1 months ago
// clone.end = end of last month
// clone.length = the length of the last month in days

var currentRange = moment().current('month');

// currentRange.start = start of the month
// currentRange.end = yesterday
// currentRange.length = the number of days since the start of this month
```

It's also possible to construct a range yourself:

```js
import Range from 'previous-date-range';

var range = new Range({
    date: new Date(),
    units: 5,
    measure: 'days'
});

// The results are the same as above
```

## Options

- `date` (Date): The date to calculate the range from. _required_
- `measure` (String): Things like month, year, day, isoWeek. _required_
- `units` (Number): The amount of measures. _required_
- `margin` (Number): A gap between the the date and the end date of the range, in number of days. _optional_
- `fixedStart` (Date): A fixed start date. _optional_