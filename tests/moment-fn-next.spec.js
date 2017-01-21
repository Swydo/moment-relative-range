/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai';
import moment from 'moment';
import { extendMoment } from '../src/relative-range';

describe('moment.fn.next', function () {
  before(function () {
    extendMoment(moment);
  });

  it('should return a range', function () {
    const range = moment().next(1, 'week');

    expect(range.type).to.equal('next');
    expect(range.measure).to.equal('week');
    expect(moment.isMoment(range.start)).to.be.ok;
    expect(moment.isMoment(range.end)).to.be.ok;
  });
});
