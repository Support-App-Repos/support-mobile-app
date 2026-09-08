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
  };
}

function isServiceCategorySlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return slug.toLowerCase().includes('service');
}

module.exports = {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
};
