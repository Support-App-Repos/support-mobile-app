// src/helpers/bookingHelper.js
function computeBookingTotals(servicePrice, addons = []) {
  const base = typeof servicePrice === 'number' && !Number.isNaN(servicePrice) ? servicePrice : 0;
  const addonsTotal = (addons || []).reduce((sum, a) => {
    const p = typeof a?.price === 'number' && !Number.isNaN(a.price) ? a.price : 0;
    return sum + p;
  }, 0);
  return { addonsTotal, totalAmount: base + addonsTotal };
}

function formatAddonSnapshot(addon) {
  return {
    id: addon._id.toString(),
    name: addon.name,
    price: addon.price,
    icon: addon.icon || null,
  };
}

function isServiceCategorySlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const s = slug.toLowerCase();
  return s.includes('service') || s.includes('aesthetic') || s.includes('beauty');
}

function isEventCategorySlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return slug.toLowerCase().includes('event');
}

function isProductCategorySlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return slug.toLowerCase().includes('product');
}

function computeEventBookingTotal(unitPrice, ticketQuantity) {
  const price = typeof unitPrice === 'number' && !Number.isNaN(unitPrice) ? unitPrice : 0;
  const qty =
    typeof ticketQuantity === 'number' && Number.isInteger(ticketQuantity) ? ticketQuantity : 0;
  return price * qty;
}

function normalizeTicketQuantity(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isInteger(n)) return null;
  if (n < 1 || n > 5) return null;
  return n;
}

function formatEventDateSnapshot(eventDate) {
  if (!eventDate) return null;
  if (typeof eventDate === 'string') {
    const trimmed = eventDate.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return trimmed;
  }
  if (eventDate instanceof Date && !Number.isNaN(eventDate.getTime())) {
    return eventDate.toISOString().slice(0, 10);
  }
  return null;
}

/** Stripe expects lowercase ISO currency codes */
function normalizeStripeCurrency(currency) {
  const c = String(currency || 'usd').trim().toLowerCase();
  if (!c) return 'usd';
  return c;
}

function isFreePriceType(priceType) {
  return /^free$/i.test(String(priceType || '').trim());
}

function requiresBookingPayment(totalAmount, priceType) {
  if (isFreePriceType(priceType)) return false;
  const amount = typeof totalAmount === 'number' && !Number.isNaN(totalAmount) ? totalAmount : 0;
  return amount > 0;
}

module.exports = {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
  isEventCategorySlug,
  isProductCategorySlug,
  computeEventBookingTotal,
  normalizeTicketQuantity,
  formatEventDateSnapshot,
  normalizeStripeCurrency,
  isFreePriceType,
  requiresBookingPayment,
};
