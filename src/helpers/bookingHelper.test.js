// src/helpers/bookingHelper.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
} = require('./bookingHelper');

describe('computeBookingTotals', () => {
  it('sums service price and addon prices', () => {
    const result = computeBookingTotals(100, [
      { price: 10 },
      { price: 5.5 },
    ]);
    assert.deepEqual(result, { addonsTotal: 15.5, totalAmount: 115.5 });
  });

  it('treats missing service price as 0', () => {
    const result = computeBookingTotals(null, [{ price: 20 }]);
    assert.deepEqual(result, { addonsTotal: 20, totalAmount: 20 });
  });
});

describe('formatAddonSnapshot', () => {
  it('maps mongo addon doc to snapshot', () => {
    assert.deepEqual(
      formatAddonSnapshot({
        _id: { toString: () => 'abc' },
        name: 'Extra',
        price: 12,
      }),
      { id: 'abc', name: 'Extra', price: 12 },
    );
  });
});

describe('isServiceCategorySlug', () => {
  it('matches services slug', () => {
    assert.equal(isServiceCategorySlug('services'), true);
    assert.equal(isServiceCategorySlug('products'), false);
    assert.equal(isServiceCategorySlug(null), false);
  });
});
