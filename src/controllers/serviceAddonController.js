const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatAddon = (doc) => ({
  id: doc._id.toString(),
  listingId: doc.listing_id?.toString(),
  storeId: doc.store_id?.toString() || null,
  userId: doc.user_id?.toString(),
  name: doc.name,
  description: doc.description || null,
  price: doc.price,
  icon: doc.icon || null,
  isActive: doc.is_active !== false,
  sortOrder: doc.sort_order || 0,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
});

async function loadOwnedListing(listingId, userId) {
  const listingCollection = await getCollection('Listing');
  const listingObj = toObjectId(listingId);
  if (!listingObj) return { error: { status: 400, message: 'Invalid listing id' } };
  const listing = await listingCollection.findOne({ _id: listingObj });
  if (!listing) return { error: { status: 404, message: 'Listing not found' } };
  if (listing.user_id?.toString() !== userId) {
    return { error: { status: 403, message: 'Forbidden' } };
  }
  return { listing };
}

exports.getAddons = async (req, res) => {
  try {
    const listingObj = toObjectId(req.params.listingId);
    if (!listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid listing id' });
    }

    const listingCollection = await getCollection('Listing');
    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const wantAll = req.query.all === '1' || req.query.all === 'true';
    const userId = getUserId(req);
    const isOwner = userId && listing.user_id?.toString() === userId;

    const addonCollection = await getCollection('ServiceAddon');
    const query = { listing_id: listingObj };
    if (!(wantAll && isOwner)) {
      query.is_active = true;
    }

    const addons = await addonCollection
      .find(query)
      .sort({ sort_order: 1, created_at: 1 })
      .toArray();

    res.json({ success: true, data: addons.map(formatAddon) });
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addons', error: error.message });
  }
};

exports.createAddon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const owned = await loadOwnedListing(req.params.listingId, userId);
    if (owned.error) {
      return res.status(owned.error.status).json({ success: false, message: owned.error.message });
    }

    const { name, description, price, icon, isActive, sortOrder } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a number >= 0' });
    }

    const now = new Date();
    const doc = {
      listing_id: owned.listing._id,
      store_id: owned.listing.store_id || null,
      user_id: toObjectId(userId),
      name: name.trim(),
      description: description?.trim() || null,
      price,
      icon: icon?.trim() || null,
      is_active: isActive !== false,
      sort_order: typeof sortOrder === 'number' ? sortOrder : 0,
      created_at: now,
      updated_at: now,
    };

    const addonCollection = await getCollection('ServiceAddon');
    const result = await addonCollection.insertOne(doc);
    const created = await addonCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, data: formatAddon(created) });
  } catch (error) {
    console.error('Error creating addon:', error);
    res.status(500).json({ success: false, message: 'Failed to create addon', error: error.message });
  }
};

exports.updateAddon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const owned = await loadOwnedListing(req.params.listingId, userId);
    if (owned.error) {
      return res.status(owned.error.status).json({ success: false, message: owned.error.message });
    }

    const addonObj = toObjectId(req.params.addonId);
    if (!addonObj) {
      return res.status(400).json({ success: false, message: 'Invalid addon id' });
    }

    const addonCollection = await getCollection('ServiceAddon');
    const existing = await addonCollection.findOne({
      _id: addonObj,
      listing_id: owned.listing._id,
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Add-on not found' });
    }

    const { name, description, price, icon, isActive, sortOrder } = req.body;
    const update = { updated_at: new Date() };
    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }
      update.name = name.trim();
    }
    if (description !== undefined) update.description = description?.trim() || null;
    if (price !== undefined) {
      if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a number >= 0' });
      }
      update.price = price;
    }
    if (icon !== undefined) update.icon = icon?.trim() || null;
    if (isActive !== undefined) update.is_active = !!isActive;
    if (sortOrder !== undefined) update.sort_order = sortOrder;

    await addonCollection.updateOne({ _id: addonObj }, { $set: update });
    const updated = await addonCollection.findOne({ _id: addonObj });
    res.json({ success: true, data: formatAddon(updated) });
  } catch (error) {
    console.error('Error updating addon:', error);
    res.status(500).json({ success: false, message: 'Failed to update addon', error: error.message });
  }
};

exports.deleteAddon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const owned = await loadOwnedListing(req.params.listingId, userId);
    if (owned.error) {
      return res.status(owned.error.status).json({ success: false, message: owned.error.message });
    }

    const addonObj = toObjectId(req.params.addonId);
    if (!addonObj) {
      return res.status(400).json({ success: false, message: 'Invalid addon id' });
    }

    const addonCollection = await getCollection('ServiceAddon');
    const result = await addonCollection.deleteOne({
      _id: addonObj,
      listing_id: owned.listing._id,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Add-on not found' });
    }
    res.json({ success: true, message: 'Add-on deleted' });
  } catch (error) {
    console.error('Error deleting addon:', error);
    res.status(500).json({ success: false, message: 'Failed to delete addon', error: error.message });
  }
};
