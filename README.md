RelativeRange
=============

Calculate a date range relative to a certain moment.

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

## Initiation
```js
import moment from 'moment';
import { extendMoment } from 'previous-date-range';

extendMoment(moment);
```

## Basic usage

### Previous
You can use `moment().previous(units, measure)`:

```js
var range = moment().previous(5, 'days');

// range.start = 6 days ago
// range.end = yesterday
// range.length = 5

var clone = range.previous(1, 'months');

// clone.start = start of 1 months ago
// clone.end = end of last month
// clone.length = the length of the last month in days
```

### Current
You can use `moment().current(measure)`:

```js
var currentRange = moment().current('month');

// currentRange.start = start of the month
// currentRange.end = yesterday
// currentRange.length = the number of days since the start of this month
```

## Custom
It's also possible to construct a range yourself:

```js
import RelativeRange from 'previous-date-range';

var range = new RelativeRange({
    date: new Date(),
    units: 5,
    measure: 'days'
});

// The results are the same as above
```

### Options

- `date` (Date): The date to calculate the range from. _required_
- `measure` (String): Things like month, year, day, isoWeek. _required_
- `units` (Number): The amount of measures. _required_
- `margin` (Number): A gap between the the date and the end date of the range, in number of days. _optional_
- `fixedStart` (Date): A fixed start date. _optional_

## moment.range

There is a great package called [moment-range](https://www.npmjs.com/package/moment-range), which works great with this package:

```js
import moment from 'moment';
import { extendMoment } from 'moment-range';

extendMoment(moment);

const range = moment.range(moment().previous(5, 'days').toArray());
```
