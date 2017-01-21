RelativeRange
=============

Calculate a date range relative to a certain moment.

[![Build status](https://api.travis-ci.org/jamiter/previous-date-range.png)](https://travis-ci.org/jamiter/previous-date-range)
[![Coverage Status](https://coveralls.io/repos/github/jamiter/previous-date-range/badge.svg)](https://coveralls.io/github/jamiter/previous-date-range)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Contents**

- [Installation](#installation)
  - [npm](#npm)
  - [yarn](#yarn)
- [Initiation](#initiation)
- [Basic usage](#basic-usage)
  - [Previous](#previous)
  - [Current](#current)
  - [Combinations](#combinations)
- [Custom](#custom)
  - [Options](#options)
- [Conversion](#conversion)
  - [toArray](#toarray)
- [Integrations](#integrations)
  - [moment.range](#momentrange)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
```js
var range = moment().previous(5, 'days');

// range.start = 6 days ago
// range.end = yesterday
// range.length = 5

var previousMonth = range.previous(1, 'months');

// The new range will be relative to the old one
// previousMonth.start = start of 1 months ago
// previousMonth.end = end of last month
// previousMonth.length = the length of the last month in days

var previousYear = previousMonth.previous(1, 'year');

// previousYear.start = start of the year before the previous month
// etc.
```

### Next

```js
var range = moment().next(2, 'month');

// range.start = 1st day of next month
// range.end = last day of the month after the next
```

### Current
You can use `moment().current(measure)`:

```js
var thisMonth = moment().current('month');

// thisMonth.start = start of the month
// thisMonth.end = yesterday
// thisMonth.length = the number of days since the start of this month
```

### Combinations

```js
moment()
    .previous(1, 'year') // Last year
    .current('month') // Last years December
    .previous(1, 'month') // Last years November
    .next(1, 'week'); // First week of December last year
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

## Conversion

### toArray

```js
var array = moment().current('month').toArray(); // ['YYYY-MM-DD', 'YYYY-MM-DD']
```

`toArray` takes an optional `format` parameter. Defaults to `YYYY-MM-DD`;

## Integrations

### moment.range

There is a great package called [moment-range](https://www.npmjs.com/package/moment-range), which works great with this package:

```js
import { extendMoment as extendWithRange } from 'moment-range';

extendWithRange(moment);

const last5DaysRange = moment().previous(5, 'days');

const momentRange = moment.range(last5DaysRange.toArray());

const last5Days = momentRange.by('day'); // [day1, day2, day3, day4, day5]

const relativeRange = new RelativeRange(momentRange);

relativeRange.current('month'); // etc.
```
