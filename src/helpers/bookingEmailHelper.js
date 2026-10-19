/**
 * Merchant booking notification emails (service / event).
 */

const { ObjectId } = require('mongodb');
const { getCollection } = require('../lib/mongodb');
const emailService = require('./email');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatMoney = (amount, currency) => {
  const value =
    typeof amount === 'number' && !Number.isNaN(amount) ? amount : Number(amount) || 0;
  const code = String(currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
};

const paymentStatusLabel = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'paid') return 'Paid';
  if (s === 'not_required') return 'Not required (free)';
  return status || 'Pending';
};

const loadUser = async (userId) => {
  const id = toObjectId(userId);
  if (!id) return null;
  const userCollection = await getCollection('User');
  return userCollection.findOne({ _id: id });
};

const loadStore = async (storeId) => {
  const id = toObjectId(storeId);
  if (!id) return null;
  const storeCollection = await getCollection('Store');
  return storeCollection.findOne({ _id: id });
};

const resolveMerchantContact = async ({ sellerUserId, storeId }) => {
  const seller = await loadUser(sellerUserId);
  const store = storeId ? await loadStore(storeId) : null;

  const email = seller?.email || store?.contact_email || null;
  const merchantName =
    seller?.full_name || seller?.fullName || store?.name || 'Merchant';

  return { email, merchantName, storeName: store?.name || null };
};

const buyerDisplay = (buyer) => ({
  buyerName: buyer?.full_name || buyer?.fullName || 'Customer',
  buyerEmail: buyer?.email || null,
  buyerPhone: buyer?.phone_number || buyer?.phone || null,
});

/**
 * Notify merchant after a service booking is confirmed.
 * Failures are logged only — they must not block booking creation.
 */
async function notifyMerchantServiceBooking(booking) {
  try {
    if (!booking) return;

    const [{ email, merchantName, storeName }, buyer] = await Promise.all([
      resolveMerchantContact({
        sellerUserId: booking.seller_user_id,
        storeId: booking.store_id,
      }),
      loadUser(booking.buyer_user_id),
    ]);

    if (!email) {
      console.warn('[BookingEmail] No merchant email for service booking', booking._id?.toString());
      return;
    }

    const addons = Array.isArray(booking.addons_snapshot) ? booking.addons_snapshot : [];
    const addonsSummary =
      addons.length > 0
        ? addons.map((a) => `${a.name}${a.price != null ? ` (${formatMoney(a.price, booking.currency)})` : ''}`).join(', ')
        : null;

    await emailService.sendServiceBookingMerchantEmail({
      email,
      merchantName,
      storeName,
      bookingId: booking._id?.toString() || '',
      serviceTitle: booking.service_title || 'Service',
      appointmentDate: booking.appointment_date || '—',
      appointmentTime: booking.appointment_time || '—',
      duration: booking.duration || null,
      addonsSummary,
      totalLabel: formatMoney(booking.total_amount, booking.currency),
      paymentStatusLabel: paymentStatusLabel(booking.payment_status),
      ...buyerDisplay(buyer),
    });
  } catch (error) {
    console.error('[BookingEmail] Service booking merchant email failed:', error);
  }
}

/**
 * Notify merchant after an event booking is confirmed.
 * Failures are logged only — they must not block booking creation.
 */
async function notifyMerchantEventBooking(booking) {
  try {
    if (!booking) return;

    const [{ email, merchantName, storeName }, buyer] = await Promise.all([
      resolveMerchantContact({
        sellerUserId: booking.seller_user_id,
        storeId: booking.store_id,
      }),
      loadUser(booking.buyer_user_id),
    ]);

    if (!email) {
      console.warn('[BookingEmail] No merchant email for event booking', booking._id?.toString());
      return;
    }

    await emailService.sendEventBookingMerchantEmail({
      email,
      merchantName,
      storeName,
      bookingId: booking._id?.toString() || '',
      eventTitle: booking.event_title || 'Event',
      eventDate: booking.event_date || null,
      eventTime: booking.event_time || null,
      location: booking.location || null,
      ticketQuantity: booking.ticket_quantity ?? 1,
      totalLabel: formatMoney(booking.total_amount, booking.currency),
      paymentStatusLabel: paymentStatusLabel(booking.payment_status),
      ...buyerDisplay(buyer),
    });
  } catch (error) {
    console.error('[BookingEmail] Event booking merchant email failed:', error);
  }
}

module.exports = {
  notifyMerchantServiceBooking,
  notifyMerchantEventBooking,
};
