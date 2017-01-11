previous-date-range
===================

Calculate a date range in the past from a certain moment

![Build status](https://api.travis-ci.org/jamiter/previous-date-range.png)

## Installation

```bash
npm install previous-date-range --save
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

range.previous(2, 'months');

// range.start = start of 2 months ago
// range.end = end of last month
// range.length = the length of the last 2 months
```

It's also possible to construct a range yourself:

```js
import { PreviousDateRange as Range } from 'previous-date-range';

var range = new Range({
    date: new Date(),
    units: 5,
    measure: 'days'
});

// The results are the same as above
```
