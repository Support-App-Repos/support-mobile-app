import { computeBookingTotals, requiresBookingPayment } from '../src/utils/bookingTotals';

describe('computeBookingTotals', () => {
  it('adds service and addon prices', () => {
    expect(
      computeBookingTotals(50, [
        { price: 10 },
        { price: 5 },
      ]),
    ).toEqual({ addonsTotal: 15, totalAmount: 65 });
  });

  it('handles empty addons', () => {
    expect(computeBookingTotals(40, [])).toEqual({
      addonsTotal: 0,
      totalAmount: 40,
    });
  });
});

describe('requiresBookingPayment', () => {
  it('requires payment when total is positive', () => {
    expect(requiresBookingPayment(25, 'Fixed')).toBe(true);
  });

  it('skips payment for free price type', () => {
    expect(requiresBookingPayment(25, 'Free')).toBe(false);
  });

  it('skips payment when total is zero', () => {
    expect(requiresBookingPayment(0, 'Fixed')).toBe(false);
  });
});
