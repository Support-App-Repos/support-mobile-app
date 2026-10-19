const { getCollection } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');
const { getUserId } = require('../helpers/userHelper');
const {
  isEventCategorySlug,
  normalizeTicketQuantity,
  computeEventBookingTotal,
  formatEventDateSnapshot,
  requiresBookingPayment,
} = require('../helpers/bookingHelper');
const { assertSucceededBookingPaymentIntent } = require('../helpers/bookingPaymentHelper');
const { notifyMerchantEventBooking } = require('../helpers/bookingEmailHelper');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatEventBooking = (doc) => ({
  id: doc._id.toString(),
  storeId: doc.store_id ? doc.store_id.toString() : null,
  listingId: doc.listing_id.toString(),
  buyerUserId: doc.buyer_user_id.toString(),
  sellerUserId: doc.seller_user_id.toString(),
  eventTitle: doc.event_title,
  eventPrice: doc.event_price,
  currency: doc.currency || null,
  priceType: doc.price_type || null,
  eventDate: doc.event_date || null,
  eventTime: doc.event_time || null,
  location: doc.location || null,
  ticketQuantity: doc.ticket_quantity,
  totalAmount: doc.total_amount,
  status: doc.status,
  paymentStatus: doc.payment_status || null,
  stripePaymentIntentId: doc.stripe_payment_intent_id || null,
  notes: doc.notes || null,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
});

const buildLocationSnapshot = (listing) => {
  const parts = [listing.venue, listing.location, listing.city].filter(
    (p) => typeof p === 'string' && p.trim(),
  );
  if (parts.length === 0) return null;
  // Prefer venue, else location + city
  if (listing.venue?.trim()) return listing.venue.trim();
  return [listing.location, listing.city]
    .filter((p) => typeof p === 'string' && p.trim())
    .map((p) => p.trim())
    .join(', ');
};

exports.createEventBooking = async (req, res) => {
  try {
    const buyerUserId = getUserId(req);
    if (!buyerUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { listingId, storeId, ticketQuantity, paymentIntentId } = req.body;
    if (!listingId) {
      return res.status(400).json({ success: false, message: 'listingId is required' });
    }

    const qty = normalizeTicketQuantity(ticketQuantity ?? 1);
    if (qty == null) {
      return res.status(400).json({
        success: false,
        message: 'ticketQuantity must be an integer between 1 and 5',
      });
    }

    const listingObj = toObjectId(listingId);
    if (!listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid listingId' });
    }

    const listingCollection = await getCollection('Listing');
    const categoryCollection = await getCollection('Category');
    const bookingCollection = await getCollection('EventBooking');

    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing || listing.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Listing is not available for booking' });
    }

    const category = listing.category_id
      ? await categoryCollection.findOne({ _id: listing.category_id })
      : null;
    if (!isEventCategorySlug(category?.slug || category?.name)) {
      return res.status(400).json({ success: false, message: 'Only event listings can be booked' });
    }

    let storeObj = listing.store_id || null;
    if (storeId) {
      const requestedStore = toObjectId(storeId);
      if (!requestedStore) {
        return res.status(400).json({ success: false, message: 'Invalid storeId' });
      }
      if (listing.store_id && !listing.store_id.equals(requestedStore)) {
        return res.status(400).json({
          success: false,
          message: 'Listing does not belong to this store',
        });
      }
      storeObj = requestedStore;
    }

    const unitPrice = typeof listing.price === 'number' && !Number.isNaN(listing.price) ? listing.price : 0;
    const totalAmount = computeEventBookingTotal(unitPrice, qty);
    const needsPayment = requiresBookingPayment(totalAmount, listing.price_type);

    let paymentStatus = 'not_required';
    let stripePaymentIntentId = null;
    if (needsPayment) {
      try {
        const pi = await assertSucceededBookingPaymentIntent({
          paymentIntentId,
          userId: buyerUserId,
          listingId,
          bookingType: 'event',
          expectedAmount: totalAmount,
          expectedCurrency: listing.currency,
        });
        paymentStatus = 'paid';
        stripePaymentIntentId = pi.id;
      } catch (payErr) {
        const status = payErr.status || 400;
        return res.status(status).json({
          success: false,
          message: payErr.message || 'Payment verification failed',
        });
      }
    }

    const now = new Date();

    const doc = {
      store_id: storeObj,
      listing_id: listingObj,
      buyer_user_id: toObjectId(buyerUserId),
      seller_user_id: listing.user_id,
      event_title: listing.title,
      event_price: unitPrice,
      currency: listing.currency || null,
      price_type: listing.price_type || null,
      event_date: formatEventDateSnapshot(listing.event_date),
      event_time: listing.event_time ? String(listing.event_time) : null,
      location: buildLocationSnapshot(listing),
      ticket_quantity: qty,
      total_amount: totalAmount,
      status: 'Confirmed',
      payment_status: paymentStatus,
      stripe_payment_intent_id: stripePaymentIntentId,
      notes: null,
      created_at: now,
      updated_at: now,
    };

    const result = await bookingCollection.insertOne(doc);
    const created = await bookingCollection.findOne({ _id: result.insertedId });

    // Fire-and-forget merchant notification
    notifyMerchantEventBooking(created);

    res.status(201).json({ success: true, data: formatEventBooking(created) });
  } catch (error) {
    console.error('Error creating event booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event booking',
      error: error.message,
    });
  }
};

exports.getEventBookingById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bookingObj = toObjectId(req.params.id);
    if (!bookingObj) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const bookingCollection = await getCollection('EventBooking');
    const booking = await bookingCollection.findOne({ _id: bookingObj });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isBuyer = booking.buyer_user_id?.toString() === userId;
    const isSeller = booking.seller_user_id?.toString() === userId;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: formatEventBooking(booking) });
  } catch (error) {
    console.error('Error fetching event booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event booking',
      error: error.message,
    });
  }
};
