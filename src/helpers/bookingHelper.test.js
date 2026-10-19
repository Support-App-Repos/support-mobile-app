// src/helpers/bookingHelper.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
  isEventCategorySlug,
  computeEventBookingTotal,
  normalizeTicketQuantity,
  formatEventDateSnapshot,
  requiresBookingPayment,
  normalizeStripeCurrency,
  isProductCategorySlug,
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
        icon: '🧴',
      }),
      { id: 'abc', name: 'Extra', price: 12, icon: '🧴' },
    );
  });
});

describe('isServiceCategorySlug', () => {
  it('matches services slug', () => {
    assert.equal(isServiceCategorySlug('services'), true);
    assert.equal(isServiceCategorySlug('aesthetics'), true);
    assert.equal(isServiceCategorySlug('products'), false);
    assert.equal(isServiceCategorySlug(null), false);
  });
});

describe('isEventCategorySlug', () => {
  it('matches events slug', () => {
    assert.equal(isEventCategorySlug('events'), true);
    assert.equal(isEventCategorySlug('services'), false);
    assert.equal(isEventCategorySlug(null), false);
  });
});

describe('normalizeTicketQuantity', () => {
  it('accepts 1–5 only', () => {
    assert.equal(normalizeTicketQuantity(1), 1);
    assert.equal(normalizeTicketQuantity(5), 5);
    assert.equal(normalizeTicketQuantity(0), null);
    assert.equal(normalizeTicketQuantity(6), null);
    assert.equal(normalizeTicketQuantity(1.5), null);
  });
});

describe('computeEventBookingTotal', () => {
  it('multiplies unit price by quantity', () => {
    assert.equal(computeEventBookingTotal(25, 3), 75);
    assert.equal(computeEventBookingTotal(null, 2), 0);
  });
});

describe('formatEventDateSnapshot', () => {
  it('formats date values to YYYY-MM-DD when possible', () => {
    assert.equal(formatEventDateSnapshot('2026-07-31T12:00:00.000Z'), '2026-07-31');
    assert.equal(formatEventDateSnapshot(null), null);
  });
});

describe('requiresBookingPayment', () => {
  it('requires payment when total is positive', () => {
    assert.equal(requiresBookingPayment(10, 'Fixed'), true);
  });
  it('skips free price type and zero totals', () => {
    assert.equal(requiresBookingPayment(10, 'Free'), false);
    assert.equal(requiresBookingPayment(0, 'Fixed'), false);
  });
});

describe('normalizeStripeCurrency', () => {
  it('lowercases and defaults to usd', () => {
    assert.equal(normalizeStripeCurrency('GBP'), 'gbp');
    assert.equal(normalizeStripeCurrency(null), 'usd');
  });
});

describe('isProductCategorySlug', () => {
  it('matches product categories', () => {
    assert.equal(isProductCategorySlug('Products'), true);
    assert.equal(isProductCategorySlug('product'), true);
    assert.equal(isProductCategorySlug('Services'), false);
  });
});
