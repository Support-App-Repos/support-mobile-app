/**
 * Admin Controller
 * Dashboard stats, store management, and admin-only queries
 */

const { getCollection } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatAdminStore = (store, owner, extras = {}) => ({
  id: store._id.toString(),
  name: store.name,
  slug: store.slug,
  businessCategory: store.business_category,
  logoUrl: store.logo_url || null,
  status: store.status,
  verificationStatus: store.verification_status,
  isVerified: store.is_verified === true,
  ratingAverage: store.rating_average || 0,
  reviewsCount: store.reviews_count || 0,
  viewsCount: store.views_count || 0,
  createdAt: store.created_at,
  updatedAt: store.updated_at,
  owner: owner
    ? {
        id: owner._id.toString(),
        fullName: owner.full_name || 'Unknown',
        email: owner.email || '',
        phoneNumber: owner.phone_number || '',
      }
    : null,
  ...extras,
});

exports.getDashboard = async (req, res) => {
  try {
    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const userCollection = await getCollection('User');
    const subscriptionCollection = await getCollection('Subscription');

    const [
      totalStores,
      pendingStores,
      pendingListings,
      activeListings,
      totalUsers,
      recentStores,
      topStores,
    ] = await Promise.all([
      storeCollection.countDocuments({}),
      storeCollection.countDocuments({ verification_status: 'pending' }),
      listingCollection.countDocuments({ status: 'Pending' }),
      listingCollection.countDocuments({ status: 'Active' }),
      userCollection.countDocuments({}),
      storeCollection.find({}).sort({ created_at: -1 }).limit(4).toArray(),
      storeCollection.find({ is_verified: true }).sort({ views_count: -1 }).limit(4).toArray(),
    ]);

    let revenue = 0;
    try {
      const subs = await subscriptionCollection
        .find({ status: { $in: ['Active', 'active', 'paid', 'Paid'] } })
        .toArray();
      revenue = subs.reduce((sum, s) => sum + (Number(s.amount) || Number(s.price) || 0), 0);
    } catch {
      revenue = 0;
    }

    const ownerIds = [...recentStores, ...topStores]
      .map((s) => s.user_id)
      .filter(Boolean);
    const uniqueOwnerIds = [...new Set(ownerIds.map((id) => id.toString()))].map(
      (id) => new ObjectId(id)
    );
    const owners = uniqueOwnerIds.length
      ? await userCollection.find({ _id: { $in: uniqueOwnerIds } }).toArray()
      : [];
    const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

    const listingCounts = await Promise.all(
      topStores.map(async (store) => {
        const count = await listingCollection.countDocuments({
          store_id: store._id,
          status: 'Active',
        });
        return { storeId: store._id.toString(), count };
      })
    );
    const listingCountMap = new Map(listingCounts.map((c) => [c.storeId, c.count]));

    res.json({
      success: true,
      data: {
        stats: {
          totalStores,
          pendingStores,
          pendingListings,
          activeListings,
          totalUsers,
          revenue,
        },
        recentApplications: recentStores.map((store) => {
          const owner = ownerMap.get(store.user_id?.toString());
          return formatAdminStore(store, owner);
        }),
        topStores: topStores.map((store) => {
          const owner = ownerMap.get(store.user_id?.toString());
          return formatAdminStore(store, owner, {
            activeListings: listingCountMap.get(store._id.toString()) || 0,
          });
        }),
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message,
    });
  }
};

exports.getAdminStores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      verificationStatus,
      status,
    } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const storeCollection = await getCollection('Store');
    const userCollection = await getCollection('User');
    const listingCollection = await getCollection('Listing');

    const query = {};
    if (verificationStatus === 'verified') {
      query.verification_status = 'verified';
      query.status = { $ne: 'suspended' };
    } else if (verificationStatus) {
      query.verification_status = verificationStatus;
    }
    if (status) {
      query.status = status;
    }
    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: regex }, { business_category: regex }];
    }

    const stores = await storeCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .toArray();

    const total = await storeCollection.countDocuments(query);

    const ownerIds = stores.map((s) => s.user_id).filter(Boolean);
    const owners = ownerIds.length
      ? await userCollection.find({ _id: { $in: ownerIds } }).toArray()
      : [];
    const ownerMap = new Map(owners.map((o) => [o._id.toString(), o]));

    const data = await Promise.all(
      stores.map(async (store) => {
        const owner = ownerMap.get(store.user_id?.toString());
        const listingsCount = await listingCollection.countDocuments({
          store_id: store._id,
        });
        return formatAdminStore(store, owner, { listingsCount });
      })
    );

    const counts = {
      pending: await storeCollection.countDocuments({ verification_status: 'pending' }),
      verified: await storeCollection.countDocuments({
        verification_status: 'verified',
        status: { $ne: 'suspended' },
      }),
      rejected: await storeCollection.countDocuments({ verification_status: 'rejected' }),
      suspended: await storeCollection.countDocuments({ status: 'suspended' }),
    };

    res.json({
      success: true,
      data,
      counts,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message,
    });
  }
};

exports.getStoreDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const storeIdObj = toObjectId(id);
    if (!storeIdObj) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    const docCollection = await getCollection('StoreDocument');
    const documents = await docCollection
      .find({ store_id: storeIdObj })
      .sort({ created_at: -1 })
      .toArray();

    res.json({
      success: true,
      data: documents.map((doc) => ({
        id: doc._id.toString(),
        documentUrl: doc.document_url,
        documentType: doc.document_type,
        status: doc.status,
        createdAt: doc.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching store documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message,
    });
  }
};

exports.getAdminListings = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', status } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');
    const userCollection = await getCollection('User');
    const storeCollection = await getCollection('Store');

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    const listings = await listingCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .toArray();

    const total = await listingCollection.countDocuments(query);

    const counts = {
      pending: await listingCollection.countDocuments({ status: 'Pending' }),
      active: await listingCollection.countDocuments({ status: 'Active' }),
      rejected: await listingCollection.countDocuments({ status: 'Rejected' }),
      expired: await listingCollection.countDocuments({ status: 'Expired' }),
    };

    const data = await Promise.all(
      listings.map(async (listing) => {
        const photos = await listingPhotoCollection
          .find({ listing_id: listing._id })
          .sort({ is_primary: -1, photo_order: 1 })
          .toArray();

        const category = listing.category_id
          ? await categoryCollection.findOne({ _id: listing.category_id })
          : null;
        const user = listing.user_id
          ? await userCollection.findOne({ _id: listing.user_id })
          : null;
        const store = listing.store_id
          ? await storeCollection.findOne({ _id: listing.store_id })
          : null;

        return {
          id: listing._id.toString(),
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceType: listing.price_type,
          currency: listing.currency,
          location: listing.location,
          city: listing.city,
          status: listing.status,
          viewsCount: listing.views_count || 0,
          createdAt: listing.created_at,
          updatedAt: listing.updated_at,
          photos: photos.map((p) => ({
            id: p._id.toString(),
            photoUrl: p.photo_url,
            isPrimary: p.is_primary,
          })),
          category: category
            ? { id: category._id.toString(), name: category.name, slug: category.slug }
            : null,
          user: user
            ? {
                id: user._id.toString(),
                fullName: user.full_name,
                email: user.email,
              }
            : null,
          store: store
            ? { id: store._id.toString(), name: store.name }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data,
      counts,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message,
    });
  }
};

exports.updateStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ['active', 'suspended', 'draft'];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${valid.join(', ')}`,
      });
    }

    const storeIdObj = toObjectId(id);
    const storeCollection = await getCollection('Store');
    const store = await storeCollection.findOne({ _id: storeIdObj });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    await storeCollection.updateOne(
      { _id: storeIdObj },
      { $set: { status, updated_at: new Date() } }
    );

    const updated = await storeCollection.findOne({ _id: storeIdObj });
    res.json({
      success: true,
      data: { id: updated._id.toString(), status: updated.status },
      message: `Store status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating store status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store status',
      error: error.message,
    });
  }
};
