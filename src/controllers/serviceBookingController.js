const { getCollection } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');
const { getUserId } = require('../helpers/userHelper');
const {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
} = require('../helpers/bookingHelper');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatCatalogListing = (listing, photos, category) => ({
  id: listing._id.toString(),
  title: listing.title,
  description: listing.description,
  price: listing.price ?? null,
  priceType: listing.price_type ?? null,
  currency: listing.currency ?? null,
  duration: listing.duration ?? null,
  specialization: listing.specialization ?? null,
  ratingAverage: listing.rating_average || 0,
  photos: (photos || []).map((p) => ({
    id: p._id.toString(),
    photoUrl: p.photo_url,
    isPrimary: p.is_primary,
  })),
  category: category
    ? { id: category._id.toString(), name: category.name, slug: category.slug }
    : null,
});

exports.getStoreServiceListings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const highlightListingId = req.query.highlightListingId || null;

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');

    let store = null;
    const storeObj = toObjectId(storeId);
    if (storeObj) store = await storeCollection.findOne({ _id: storeObj });
    if (!store) store = await storeCollection.findOne({ slug: storeId });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const categories = await categoryCollection.find({}).toArray();
    const serviceCategoryIds = categories
      .filter((c) => isServiceCategorySlug(c.slug || c.name))
      .map((c) => c._id);

    const query = {
      store_id: store._id,
      status: 'Active',
      category_id: { $in: serviceCategoryIds },
    };

    let listings = await listingCollection.find(query).sort({ created_at: -1 }).toArray();

    const highlightObj = toObjectId(highlightListingId);
    if (highlightObj) {
      const idx = listings.findIndex((l) => l._id.equals(highlightObj));
      if (idx > 0) {
        const [highlighted] = listings.splice(idx, 1);
        listings.unshift(highlighted);
      }
    }

    const data = await Promise.all(
      listings.map(async (listing) => {
        const photos = await listingPhotoCollection
          .find({ listing_id: listing._id })
          .sort({ is_primary: -1, photo_order: 1 })
          .toArray();
        const category = listing.category_id
          ? categories.find((c) => c._id.equals(listing.category_id))
          : null;
        return formatCatalogListing(listing, photos, category);
      }),
    );

    res.json({
      success: true,
      data: {
        store: {
          id: store._id.toString(),
          name: store.name,
          logoUrl: store.logo_url || null,
          isVerified: store.is_verified === true,
          ratingAverage: store.rating_average || 0,
          businessCategory: store.business_category,
        },
        listings: data,
        highlightListingId: highlightListingId || null,
      },
    });
  } catch (error) {
    console.error('Error fetching store service listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store service listings',
      error: error.message,
    });
  }
};

const formatBooking = (doc) => ({
  id: doc._id.toString(),
  storeId: doc.store_id.toString(),
  listingId: doc.listing_id.toString(),
  buyerUserId: doc.buyer_user_id.toString(),
  sellerUserId: doc.seller_user_id.toString(),
  serviceTitle: doc.service_title,
  servicePrice: doc.service_price,
  currency: doc.currency || null,
  priceType: doc.price_type || null,
  duration: doc.duration || null,
  appointmentDate: doc.appointment_date,
  appointmentTime: doc.appointment_time,
  addonIds: (doc.addon_ids || []).map((id) => id.toString()),
  addonsSnapshot: doc.addons_snapshot || [],
  addonsTotal: doc.addons_total,
  totalAmount: doc.total_amount,
  status: doc.status,
  notes: doc.notes || null,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
});

exports.createBooking = async (req, res) => {
  try {
    const buyerUserId = getUserId(req);
    if (!buyerUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { storeId, listingId, appointmentDate, appointmentTime, addonIds = [] } = req.body;
    if (!storeId || !listingId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'storeId, listingId, appointmentDate, and appointmentTime are required',
      });
    }

    const storeObj = toObjectId(storeId);
    const listingObj = toObjectId(listingId);
    if (!storeObj || !listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid storeId or listingId' });
    }

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const categoryCollection = await getCollection('Category');
    const addonCollection = await getCollection('ServiceAddon');
    const bookingCollection = await getCollection('ServiceBooking');

    const store = await storeCollection.findOne({ _id: storeObj });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing || listing.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Listing is not available for booking' });
    }
    if (!listing.store_id || !listing.store_id.equals(storeObj)) {
      return res.status(400).json({ success: false, message: 'Listing does not belong to this store' });
    }

    const category = listing.category_id
      ? await categoryCollection.findOne({ _id: listing.category_id })
      : null;
    if (!isServiceCategorySlug(category?.slug || category?.name)) {
      return res.status(400).json({ success: false, message: 'Only service listings can be booked' });
    }

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

    const snapshots = selectedAddons.map(formatAddonSnapshot);
    const { addonsTotal, totalAmount } = computeBookingTotals(listing.price, selectedAddons);
    const now = new Date();

    const doc = {
      store_id: storeObj,
      listing_id: listingObj,
      buyer_user_id: toObjectId(buyerUserId),
      seller_user_id: listing.user_id,
      service_title: listing.title,
      service_price: typeof listing.price === 'number' ? listing.price : 0,
      currency: listing.currency || null,
      price_type: listing.price_type || null,
      duration: listing.duration || null,
      appointment_date: String(appointmentDate),
      appointment_time: String(appointmentTime),
      addon_ids: selectedAddons.map((a) => a._id),
      addons_snapshot: snapshots,
      addons_total: addonsTotal,
      total_amount: totalAmount,
      status: 'Confirmed',
      notes: null,
      created_at: now,
      updated_at: now,
    };

    const result = await bookingCollection.insertOne(doc);
    const created = await bookingCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, data: formatBooking(created) });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bookingObj = toObjectId(req.params.id);
    if (!bookingObj) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const bookingCollection = await getCollection('ServiceBooking');
    const booking = await bookingCollection.findOne({ _id: bookingObj });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isBuyer = booking.buyer_user_id?.toString() === userId;
    const isSeller = booking.seller_user_id?.toString() === userId;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: formatBooking(booking) });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking', error: error.message });
  }
};
