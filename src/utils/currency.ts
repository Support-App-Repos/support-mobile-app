/**
 * Display listing prices with symbols where standard (matches design: "$ 2,000,000" not "USD 2000000").
 */

export function formatListingPrice(
  price: number | null | undefined,
  currency?: string | null,
): string {
  const amount = price != null && !Number.isNaN(Number(price)) ? Number(price) : 0;
  const formatted = amount.toLocaleString();

  const raw = currency?.trim();
  if (!raw) {
    return `$ ${formatted}`;
  }

  const c = raw.toUpperCase();
  switch (c) {
    case 'USD':
      return `$ ${formatted}`;
    case 'EUR':
      return `€ ${formatted}`;
    case 'GBP':
      return `£ ${formatted}`;
    case 'AED':
      return `AED ${formatted}`;
    default:
      return `${c} ${formatted}`;
  }
}
