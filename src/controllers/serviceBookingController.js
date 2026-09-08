const { getCollection } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');
const { isServiceCategorySlug } = require('../helpers/bookingHelper');

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

// placeholders filled in later tasks
exports.createBooking = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
exports.getBookingById = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
