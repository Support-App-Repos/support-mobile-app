/**
 * Store Controller
 * Handles store creation, profile, dashboard, and verification
 */

const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const emailService = require('../helpers/email');
const { ObjectId } = require('mongodb');

const BUSINESS_CATEGORIES = ['Aesthetics'];

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const slugify = (name) =>
  (name || 'store')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'store';

const sendStoreVerificationEmail = async (store, status, rejectionReason) => {
  try {
    const userCollection = await getCollection('User');
    const user = store.user_id
      ? await userCollection.findOne({ _id: toObjectId(store.user_id) })
      : null;
    const email = user?.email || store.contact_email;
    if (!email) {
      console.warn('[Store] No email found for verification notification');
      return;
    }

    const name = user?.full_name || store.name || 'Store Owner';
    const props = { email, name, storeName: store.name };

    if (status === 'verified') {
      await emailService.sendStoreVerificationApprovedEmail(props);
    } else if (status === 'rejected') {
      await emailService.sendStoreVerificationRejectedEmail({
        ...props,
        rejectionReason: rejectionReason || null,
      });
    }
  } catch (error) {
    console.error('[Store] Verification email send error:', error);
  }
};

const formatStore = (store, extras = {}) => ({
  id: store._id.toString(),
  userId: store.user_id?.toString(),
  name: store.name,
  slug: store.slug,
  logoUrl: store.logo_url || null,
  coverImageUrl: store.cover_image_url || null,
  businessCategory: store.business_category,
  description: store.description || null,
  address: store.address || null,
  city: store.city || null,
  location: store.location || null,
  contactPhone: store.contact_phone || null,
  contactEmail: store.contact_email || null,
  workingHours: store.working_hours || null,
  status: store.status,
  verificationStatus: store.verification_status,
  isVerified: store.is_verified === true,
  ratingAverage: store.rating_average || 0,
  reviewsCount: store.reviews_count || 0,
  viewsCount: store.views_count || 0,
  createdAt: store.created_at,
  updatedAt: store.updated_at,
  ...extras,
});

const hydrateListing = async (listing, collections) => {
  const { listingPhotoCollection, categoryCollection } = collections;
  const allPhotos = await listingPhotoCollection
    .find({ listing_id: listing._id })
    .sort({ is_primary: -1, photo_order: 1 })
    .toArray();
  const category = listing.category_id
    ? await categoryCollection.findOne({ _id: listing.category_id })
    : null;

  return {
    id: listing._id.toString(),
    title: listing.title,
    description: listing.description,
    price: listing.price,
    priceType: listing.price_type,
    location: listing.location,
    city: listing.city,
    status: listing.status,
    viewsCount: listing.views_count || 0,
    ratingAverage: listing.rating_average || 0,
    reviewsCount: listing.reviews_count || 0,
    publishedAt: listing.published_at,
    createdAt: listing.created_at,
    photos: allPhotos.map((p) => ({
      id: p._id.toString(),
      photoUrl: p.photo_url,
      photoOrder: p.photo_order,
      isPrimary: p.is_primary,
    })),
    category: category
      ? {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
        }
      : null,
  };
};

exports.createStore = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      name,
      logoUrl,
      coverImageUrl,
      businessCategory,
      description,
      address,
      city,
      location,
      contactPhone,
      contactEmail,
      workingHours,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Store name is required' });
    }
    if (!businessCategory || !BUSINESS_CATEGORIES.includes(businessCategory)) {
      return res.status(400).json({
        success: false,
        message: `Business category must be one of: ${BUSINESS_CATEGORIES.join(', ')}`,
      });
    }

    const storeCollection = await getCollection('Store');
    const userIdObj = toObjectId(userId);

    const existing = await storeCollection.findOne({ user_id: userIdObj });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a store. Use update instead.',
        data: formatStore(existing),
      });
    }

    let slug = slugify(name);
    const slugExists = await storeCollection.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const now = new Date();
    const storeDoc = {
      name: name.trim(),
      slug,
      logo_url: logoUrl || null,
      cover_image_url: coverImageUrl || null,
      business_category: businessCategory,
      description: description?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      location: location?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
      contact_email: contactEmail?.trim() || null,
      working_hours: workingHours || null,
      user_id: userIdObj,
      status: 'active',
      verification_status: 'unverified',
      is_verified: false,
      rating_average: 0,
      reviews_count: 0,
      views_count: 0,
      created_at: now,
      updated_at: now,
    };

    const result = await storeCollection.insertOne(storeDoc);
    const created = await storeCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      data: formatStore(created),
      message: 'Store created successfully',
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ success: false, message: 'Failed to create store', error: error.message });
  }
};

exports.getMyStore = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const storeCollection = await getCollection('Store');
    const store = await storeCollection.findOne({ user_id: toObjectId(userId) });

    if (!store) {
      return res.json({ success: true, data: null, message: 'No store found' });
    }

    res.json({ success: true, data: formatStore(store) });
  } catch (error) {
    console.error('Error fetching my store:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch store', error: error.message });
  }
};

exports.getMyStoreBookings = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const type = String(req.query.type || 'service').toLowerCase();
    if (type !== 'service' && type !== 'event') {
      return res.status(400).json({
        success: false,
        message: 'type must be "service" or "event"',
      });
    }

    const storeCollection = await getCollection('Store');
    const userCollection = await getCollection('User');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const userIdObj = toObjectId(userId);
    if (!userIdObj) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const store = await storeCollection.findOne({ user_id: userIdObj });

    // Seller bookings work with or without a store (by seller_user_id / store_id)
    const sellerFilter = store
      ? {
          $or: [
            { store_id: store._id },
            { seller_user_id: store.user_id || userIdObj },
            { seller_user_id: userId },
          ],
        }
      : {
          $or: [{ seller_user_id: userIdObj }, { seller_user_id: userId }],
        };

    const attachBuyer = async (buyerId) => {
      if (!buyerId) return null;
      const buyer = await userCollection.findOne({ _id: buyerId });
      if (!buyer) return null;
      return {
        id: buyer._id.toString(),
        fullName: buyer.full_name || 'Customer',
        profileImageUrl: buyer.profile_image_url || null,
      };
    };

    const getListingImageUrl = async (listingId) => {
      if (!listingId) return null;
      const primary = await listingPhotoCollection.findOne(
        { listing_id: listingId, is_primary: true },
        { projection: { photo_url: 1 } },
      );
      if (primary?.photo_url) return primary.photo_url;
      const first = await listingPhotoCollection.findOne(
        { listing_id: listingId },
        { sort: { photo_order: 1 }, projection: { photo_url: 1 } },
      );
      return first?.photo_url || null;
    };

    if (type === 'event') {
      const bookingCollection = await getCollection('EventBooking');
      const docs = await bookingCollection
        .find(sellerFilter)
        .sort({ created_at: -1 })
        .toArray();

      const data = await Promise.all(
        docs.map(async (doc) => ({
          id: doc._id.toString(),
          type: 'event',
          storeId: doc.store_id ? doc.store_id.toString() : null,
          listingId: doc.listing_id.toString(),
          imageUrl: await getListingImageUrl(doc.listing_id),
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
          createdAt: doc.created_at,
          buyer: await attachBuyer(doc.buyer_user_id),
        })),
      );

      return res.json({ success: true, data });
    }

    const bookingCollection = await getCollection('ServiceBooking');
    const docs = await bookingCollection
      .find(sellerFilter)
      .sort({ created_at: -1 })
      .toArray();

    const data = await Promise.all(
      docs.map(async (doc) => ({
        id: doc._id.toString(),
        type: 'service',
        storeId: doc.store_id ? doc.store_id.toString() : null,
        listingId: doc.listing_id.toString(),
        imageUrl: await getListingImageUrl(doc.listing_id),
        serviceTitle: doc.service_title,
        servicePrice: doc.service_price,
        currency: doc.currency || null,
        priceType: doc.price_type || null,
        duration: doc.duration || null,
        appointmentDate: doc.appointment_date,
        appointmentTime: doc.appointment_time,
        addonsSnapshot: Array.isArray(doc.addons_snapshot) ? doc.addons_snapshot : [],
        addonsTotal: doc.addons_total,
        totalAmount: doc.total_amount,
        status: doc.status,
        createdAt: doc.created_at,
        buyer: await attachBuyer(doc.buyer_user_id),
      })),
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching store bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store bookings',
      error: error.message,
    });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const storeIdObj = toObjectId(id);
    if (!storeIdObj) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    const storeCollection = await getCollection('Store');
    const store = await storeCollection.findOne({ _id: storeIdObj });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    if (store.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const fieldMap = {
      name: 'name',
      logoUrl: 'logo_url',
      coverImageUrl: 'cover_image_url',
      businessCategory: 'business_category',
      description: 'description',
      address: 'address',
      city: 'city',
      location: 'location',
      contactPhone: 'contact_phone',
      contactEmail: 'contact_email',
      workingHours: 'working_hours',
      status: 'status',
    };

    if (req.body.businessCategory !== undefined) {
      if (!BUSINESS_CATEGORIES.includes(req.body.businessCategory)) {
        return res.status(400).json({
          success: false,
          message: `Business category must be one of: ${BUSINESS_CATEGORIES.join(', ')}`,
        });
      }
    }

    const updates = { updated_at: new Date() };
    Object.entries(fieldMap).forEach(([camel, snake]) => {
      if (req.body[camel] !== undefined) {
        updates[snake] = req.body[camel];
      }
    });

    if (updates.name) {
      updates.name = updates.name.trim();
    }

    await storeCollection.updateOne({ _id: storeIdObj }, { $set: updates });
    const updated = await storeCollection.findOne({ _id: storeIdObj });

    res.json({
      success: true,
      data: formatStore(updated),
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ success: false, message: 'Failed to update store', error: error.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');

    let store = null;
    const idObj = toObjectId(id);
    if (idObj) {
      store = await storeCollection.findOne({ _id: idObj });
    }
    if (!store) {
      store = await storeCollection.findOne({ slug: id });
    }

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    await storeCollection.updateOne(
      { _id: store._id },
      { $inc: { views_count: 1 }, $set: { updated_at: new Date() } }
    );

    const listingsCount = await listingCollection.countDocuments({
      store_id: store._id,
      status: 'Active',
    });

    const refreshed = await storeCollection.findOne({ _id: store._id });

    res.json({
      success: true,
      data: formatStore(refreshed, { listingsCount }),
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch store', error: error.message });
  }
};

exports.getStoreListings = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');

    let store = null;
    const idObj = toObjectId(id);
    if (idObj) {
      store = await storeCollection.findOne({ _id: idObj });
    }
    if (!store) {
      store = await storeCollection.findOne({ slug: id });
    }
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const query = { store_id: store._id };
    query.status = status || 'Active';

    const listings = await listingCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .toArray();

    const total = await listingCollection.countDocuments(query);
    const collections = { listingPhotoCollection, categoryCollection };

    const data = await Promise.all(listings.map((l) => hydrateListing(l, collections)));

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('Error fetching store listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store listings',
      error: error.message,
    });
  }
};

exports.getStoreDashboard = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const reviewCollection = await getCollection('Review');
    const userCollection = await getCollection('User');

    const store = await storeCollection.findOne({ user_id: toObjectId(userId) });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const storeId = store._id;
    const totalListings = await listingCollection.countDocuments({ store_id: storeId });
    const activeListings = await listingCollection.countDocuments({
      store_id: storeId,
      status: 'Active',
    });
    const pausedListings = await listingCollection.countDocuments({
      store_id: storeId,
      status: 'Paused',
    });

    const listingIds = (
      await listingCollection.find({ store_id: storeId }).project({ _id: 1 }).toArray()
    ).map((l) => l._id);

    let recentReviews = [];
    let totalViews = store.views_count || 0;

    if (listingIds.length > 0) {
      const listingsViews = await listingCollection
        .find({ store_id: storeId })
        .project({ views_count: 1 })
        .toArray();
      totalViews += listingsViews.reduce((sum, l) => sum + (l.views_count || 0), 0);

      const reviews = await reviewCollection
        .find({ listing_id: { $in: listingIds } })
        .sort({ created_at: -1 })
        .limit(5)
        .toArray();

      recentReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = review.user_id
            ? await userCollection.findOne({ _id: review.user_id })
            : null;
          return {
            id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            createdAt: review.created_at,
            user: reviewer
              ? {
                  id: reviewer._id.toString(),
                  fullName: reviewer.full_name || 'User',
                  profileImageUrl: reviewer.profile_image_url,
                }
              : null,
          };
        })
      );
    }

    const avgRating =
      recentReviews.length > 0
        ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length
        : store.rating_average || 0;

    res.json({
      success: true,
      data: {
        store: formatStore(store),
        stats: {
          totalListings,
          activeListings,
          pausedListings,
          messages: 0,
          views: totalViews,
          ratingAverage: avgRating,
          reviewsCount: store.reviews_count || 0,
        },
        recentReviews,
      },
    });
  } catch (error) {
    console.error('Error fetching store dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message,
    });
  }
};

exports.getStoreReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const reviewCollection = await getCollection('Review');
    const userCollection = await getCollection('User');

    let store = null;
    const idObj = toObjectId(id);
    if (idObj) {
      store = await storeCollection.findOne({ _id: idObj });
    }
    if (!store) {
      store = await storeCollection.findOne({ slug: id });
    }
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const listingIds = (
      await listingCollection.find({ store_id: store._id }).project({ _id: 1 }).toArray()
    ).map((l) => l._id);

    if (listingIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: parseInt(limit, 10), total: 0, totalPages: 0 },
      });
    }

    const query = { listing_id: { $in: listingIds } };
    const reviews = await reviewCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .toArray();

    const total = await reviewCollection.countDocuments(query);

    const data = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = review.user_id
          ? await userCollection.findOne({ _id: review.user_id })
          : null;
        return {
          id: review._id.toString(),
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          user: reviewer
            ? {
                id: reviewer._id.toString(),
                fullName: reviewer.full_name || 'User',
                profileImageUrl: reviewer.profile_image_url,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('Error fetching store reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

exports.submitVerification = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one business document is required',
      });
    }

    const storeIdObj = toObjectId(id);
    const storeCollection = await getCollection('Store');
    const docCollection = await getCollection('StoreDocument');

    const store = await storeCollection.findOne({ _id: storeIdObj });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    if (store.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const now = new Date();
    const docRecords = documents.map((doc) => ({
      store_id: storeIdObj,
      document_url: doc.documentUrl || doc.url,
      document_type: doc.documentType || 'business_license',
      status: 'pending',
      created_at: now,
    }));

    await docCollection.insertMany(docRecords);

    const autoVerify = process.env.AUTO_VERIFY_STORE === 'true';
    const verificationStatus = autoVerify ? 'verified' : 'pending';
    const isVerified = autoVerify;

    await storeCollection.updateOne(
      { _id: storeIdObj },
      {
        $set: {
          verification_status: verificationStatus,
          is_verified: isVerified,
          status: 'active',
          updated_at: now,
        },
      }
    );

    const updated = await storeCollection.findOne({ _id: storeIdObj });

    if (autoVerify) {
      await sendStoreVerificationEmail(updated, 'verified');
    }

    res.json({
      success: true,
      data: formatStore(updated),
      message: autoVerify
        ? 'Store verified successfully'
        : 'Verification submitted. Your store is under review.',
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification',
      error: error.message,
    });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ['verified', 'rejected', 'pending'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const storeIdObj = toObjectId(id);
    const storeCollection = await getCollection('Store');
    const store = await storeCollection.findOne({ _id: storeIdObj });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const previousStatus = store.verification_status;
    const now = new Date();
    await storeCollection.updateOne(
      { _id: storeIdObj },
      {
        $set: {
          verification_status: status,
          is_verified: status === 'verified',
          rejection_reason: rejectionReason || null,
          updated_at: now,
        },
      }
    );

    const updated = await storeCollection.findOne({ _id: storeIdObj });

    if (status !== previousStatus && (status === 'verified' || status === 'rejected')) {
      await sendStoreVerificationEmail(updated, status, rejectionReason);
    }

    res.json({
      success: true,
      data: formatStore(updated),
      message: `Store verification status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status',
      error: error.message,
    });
  }
};
