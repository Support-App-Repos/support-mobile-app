/**
 * Stripe payment intents for service/event bookings (platform charge)
 */

const stripe = require('../lib/stripe');
const { prisma } = require('../lib/prisma');
const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');
const {
  computeBookingTotals,
  isServiceCategorySlug,
  isEventCategorySlug,
  isProductCategorySlug,
  computeEventBookingTotal,
  normalizeTicketQuantity,
  normalizeStripeCurrency,
  requiresBookingPayment,
} = require('../helpers/bookingHelper');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

exports.createBookingPaymentIntent = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { type, listingId, addonIds = [], ticketQuantity } = req.body;

    if (!type || !listingId) {
      return res.status(400).json({
        success: false,
        message: 'type and listingId are required',
      });
    }
    if (type !== 'service' && type !== 'event' && type !== 'product') {
      return res.status(400).json({
        success: false,
        message: 'type must be "service", "event", or "product"',
      });
    }

    const listingObj = toObjectId(listingId);
    if (!listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid listingId' });
    }

    const listingCollection = await getCollection('Listing');
    const categoryCollection = await getCollection('Category');
    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing || listing.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message:
          type === 'product'
            ? 'Listing is not available for purchase'
            : 'Listing is not available for booking',
      });
    }

    const category = listing.category_id
      ? await categoryCollection.findOne({ _id: listing.category_id })
      : null;
    const categorySlug = category?.slug || category?.name || '';

    let totalAmount = 0;
    let metaExtras = {};
    let paymentPurpose = 'booking';
    let descriptionPrefix = 'Booking payment';

    if (type === 'service') {
      if (!isServiceCategorySlug(categorySlug)) {
        return res.status(400).json({
          success: false,
          message: 'Only service listings can use service booking payment',
        });
      }
      const addonCollection = await getCollection('ServiceAddon');
      let selectedAddons = [];
      if (Array.isArray(addonIds) && addonIds.length > 0) {
        const addonObjectIds = addonIds.map(toObjectId).filter(Boolean);
        selectedAddons = await addonCollection
          .find({
            _id: { $in: addonObjectIds },
            listing_id: listingObj,
            is_active: true,
          })
          .toArray();
        if (selectedAddons.length !== addonObjectIds.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more add-ons are invalid or inactive',
          });
        }
      }
      const totals = computeBookingTotals(listing.price, selectedAddons);
      totalAmount = totals.totalAmount;
      metaExtras = {
        addonIds: selectedAddons.map((a) => a._id.toString()).join(','),
        addonsTotal: String(totals.addonsTotal),
      };
    } else if (type === 'event') {
      if (!isEventCategorySlug(categorySlug)) {
        return res.status(400).json({
          success: false,
          message: 'Only event listings can use event booking payment',
        });
      }
      const qty = normalizeTicketQuantity(ticketQuantity ?? 1);
      if (qty == null) {
        return res.status(400).json({
          success: false,
          message: 'ticketQuantity must be an integer between 1 and 5',
        });
      }
      const unitPrice =
        typeof listing.price === 'number' && !Number.isNaN(listing.price) ? listing.price : 0;
      totalAmount = computeEventBookingTotal(unitPrice, qty);
      metaExtras = { ticketQuantity: String(qty) };
    } else {
      if (!isProductCategorySlug(categorySlug)) {
        return res.status(400).json({
          success: false,
          message: 'Only product listings can use product purchase payment',
        });
      }
      if (listing.user_id && String(listing.user_id) === String(userId)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot purchase your own listing',
        });
      }
      totalAmount =
        typeof listing.price === 'number' && !Number.isNaN(listing.price) ? listing.price : 0;
      metaExtras = { quantity: '1' };
      paymentPurpose = 'product_purchase';
      descriptionPrefix = 'Product purchase';
    }

    if (!requiresBookingPayment(totalAmount, listing.price_type)) {
      return res.status(400).json({
        success: false,
        message:
          type === 'product'
            ? 'This product is free and does not require payment'
            : 'This booking is free and does not require payment',
      });
    }

    const currency = normalizeStripeCurrency(listing.currency);
    const amountCents = Math.round(totalAmount * 100);
    if (amountCents < 1) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount is too small',
      });
    }

    let customerId = null;
    let userEmail = null;
    let userName = null;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      userEmail = user?.email || null;
      userName = user?.fullName || null;
    } catch {
      // Prisma may fail without replica set — fall back to Mongo
    }
    if (!userEmail) {
      const userCollection = await getCollection('User');
      const mongoUser = await userCollection.findOne({ _id: toObjectId(userId) });
      userEmail = mongoUser?.email || null;
      userName = mongoUser?.full_name || mongoUser?.fullName || null;
    }

    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: userName || undefined,
          metadata: { userId: String(userId) },
        });
        customerId = customer.id;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      customer: customerId || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        purpose: paymentPurpose,
        bookingType: type,
        userId: String(userId),
        listingId: String(listingId),
        listingTitle: listing.title || '',
        ...metaExtras,
      },
      description: `${descriptionPrefix}: ${listing.title || listingId}`,
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        currency,
      },
    });
  } catch (error) {
    console.error('Error creating booking payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking payment intent',
      error: error.message,
    });
  }
};
