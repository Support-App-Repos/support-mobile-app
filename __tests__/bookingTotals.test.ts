import { computeBookingTotals } from '../src/utils/bookingTotals';

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
