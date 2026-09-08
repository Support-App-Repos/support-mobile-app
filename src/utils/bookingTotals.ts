export function computeBookingTotals(
  servicePrice: number | null | undefined,
  addons: Array<{ price: number }>,
): { addonsTotal: number; totalAmount: number } {
  const base = typeof servicePrice === 'number' && !Number.isNaN(servicePrice) ? servicePrice : 0;
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  return { addonsTotal, totalAmount: base + addonsTotal };
}
