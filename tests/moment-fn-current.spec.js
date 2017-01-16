/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai';
import moment from 'moment';
import '../src/relative-range';

describe('moment.fn.current', function () {
  it('should return a range', function () {
    const range = moment().current('weeks');

    expect(range.type).to.equal('current');
    expect(range.measure).to.equal('weeks');
    expect(moment.isMoment(range.start)).to.be.ok;
    expect(moment.isMoment(range.end)).to.be.ok;
  });
});
