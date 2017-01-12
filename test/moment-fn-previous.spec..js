/* eslint-env mocha, chai */
/* eslint-disable no-var, vars-on-top, func-names, prefer-arrow-callback, no-unused-expressions */
var expect = require('chai').expect;
var moment = require('moment');

describe('moment.fn.previous', function () {
  it('should return a range', function () {
    var range = moment().previous(2, 'weeks');

    expect(moment.isMoment(range.start)).to.be.ok;
    expect(moment.isMoment(range.end)).to.be.ok;
  });
});
