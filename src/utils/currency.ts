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

/** Short unit label for tiles (matches Home: /hr, /seat, /mo). */
export function listingPriceUnitLabel(priceType?: string | null): string | undefined {
  if (!priceType) return undefined;
  const t = String(priceType).trim();
  if (/^per\s*hour$/i.test(t) || /^hourly$/i.test(t)) return 'hr';
  if (/^per\s*seat$/i.test(t)) return 'seat';
  if (/^per\s*month$/i.test(t) || /^monthly$/i.test(t)) return 'mo';
  if (/^per\s*day$/i.test(t) || /^daily$/i.test(t)) return 'day';
  return undefined;
}

/**
 * Price + price type for listing tiles/details.
 * Examples: "Free", "AED 50/seat", "$ 100/hr", "AED 1,200"
 */
export function formatListingPriceWithType(
  price: number | string | null | undefined,
  currency?: string | null,
  priceType?: string | null,
): string {
  const type = String(priceType || '').trim();
  const amount =
    price != null && price !== '' && !Number.isNaN(Number(price)) ? Number(price) : null;

  if (/^free$/i.test(type) || amount === 0) {
    return 'Free';
  }

  const base = formatListingPrice(amount ?? 0, currency);
  const unit = listingPriceUnitLabel(type);
  if (unit) return `${base}/${unit}`;
  if (type && !/^paid$/i.test(type)) return `${base} · ${type}`;
  return base;
}
