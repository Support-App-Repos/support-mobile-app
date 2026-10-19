/**
 * Product purchase orders (platform Stripe charge)
 */

const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');
const {
  isProductCategorySlug,
  normalizeStripeCurrency,
  requiresBookingPayment,
} = require('../helpers/bookingHelper');
const { assertSucceededProductPaymentIntent } = require('../helpers/productPaymentHelper');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatOrder = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    listingId: doc.listing_id?.toString() || null,
    buyerUserId: doc.buyer_user_id?.toString() || null,
    sellerUserId: doc.seller_user_id?.toString() || null,
    storeId: doc.store_id?.toString() || null,
    productTitle: doc.product_title || null,
    amount: doc.amount ?? 0,
    currency: doc.currency || null,
    quantity: doc.quantity ?? 1,
    status: doc.status || 'Paid',
    paymentStatus: doc.payment_status || null,
    stripePaymentIntentId: doc.stripe_payment_intent_id || null,
    createdAt: doc.created_at || null,
  };
};

exports.createProductOrder = async (req, res) => {
  try {
    const buyerUserId = getUserId(req);
    if (!buyerUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { listingId, paymentIntentId } = req.body;
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'listingId is required',
      });
    }

    const listingObj = toObjectId(listingId);
    if (!listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid listingId' });
    }

    const listingCollection = await getCollection('Listing');
    const categoryCollection = await getCollection('Category');
    const orderCollection = await getCollection('ProductOrder');

    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing || listing.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not available for purchase',
      });
    }

    if (listing.user_id && String(listing.user_id) === String(buyerUserId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own listing',
      });
    }

    const category = listing.category_id
      ? await categoryCollection.findOne({ _id: listing.category_id })
      : null;
    const categorySlug = category?.slug || category?.name || '';
    if (!isProductCategorySlug(categorySlug)) {
      return res.status(400).json({
        success: false,
        message: 'Only product listings can be purchased with Buy Now',
      });
    }

    const amount =
      typeof listing.price === 'number' && !Number.isNaN(listing.price) ? listing.price : 0;
    const needsPayment = requiresBookingPayment(amount, listing.price_type);

    let paymentStatus = 'not_required';
    let stripePaymentIntentId = null;

    if (needsPayment) {
      try {
        const pi = await assertSucceededProductPaymentIntent({
          paymentIntentId,
          userId: buyerUserId,
          listingId,
          expectedAmount: amount,
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

    // Idempotent: same succeeded PI should not create duplicate orders
    if (stripePaymentIntentId) {
      const existing = await orderCollection.findOne({
        stripe_payment_intent_id: stripePaymentIntentId,
      });
      if (existing) {
        return res.status(200).json({ success: true, data: formatOrder(existing) });
      }
    }

    const now = new Date();
    const doc = {
      listing_id: listingObj,
      buyer_user_id: toObjectId(buyerUserId),
      seller_user_id: listing.user_id || null,
      store_id: listing.store_id || null,
      product_title: listing.title || null,
      amount,
      currency: listing.currency || null,
      quantity: 1,
      status: 'Paid',
      payment_status: paymentStatus,
      stripe_payment_intent_id: stripePaymentIntentId,
      created_at: now,
      updated_at: now,
    };

    const result = await orderCollection.insertOne(doc);
    const created = await orderCollection.findOne({ _id: result.insertedId });

    return res.status(201).json({ success: true, data: formatOrder(created) });
  } catch (error) {
    console.error('Error creating product order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product order',
      error: error.message,
    });
  }
};
