/**
 * Region Controller
 * Handles region-related endpoints
 * Uses MongoDB directly to bypass Prisma's replica set requirement
 */

const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { toObjectId } = require('../helpers/mongoId');

function formatRegion(region) {
  return {
    id: region._id.toString(),
    name: region.name || '',
    country: region.country || '',
    countryCode: region.country_code || null,
    isActive: region.is_active !== false,
    createdAt: region.created_at,
    updatedAt: region.updated_at,
  };
}

// Get all regions
exports.getRegions = async (req, res) => {
  try {
    const { search } = req.query;
    const regionCollection = await getCollection('Region');

    const query = {
      is_active: { $ne: false },
    };

    if (search && String(search).trim()) {
      const term = String(search).trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { country: { $regex: term, $options: 'i' } },
      ];
    }

    const regions = await regionCollection
      .find(query)
      .sort({ country: 1, name: 1 })
      .toArray();

    res.json({
      success: true,
      data: regions.map(formatRegion),
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regions',
      error: error.message,
    });
  }
};

// Get user's recent regions
exports.getRecentRegions = async (req, res) => {
  try {
    const userId = getUserId(req);
    const userIdObj = toObjectId(userId);
    if (!userIdObj) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const userRecentRegionCollection = await getCollection('UserRecentRegion');
    const regionCollection = await getCollection('Region');

    const recentRegions = await userRecentRegionCollection
      .find({
        $or: [{ user_id: userIdObj }, { user_id: String(userId) }],
      })
      .sort({ last_used_at: -1 })
      .limit(5)
      .toArray();

    const regionIds = recentRegions
      .map((ur) => toObjectId(ur.region_id))
      .filter(Boolean);

    if (regionIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const regions = await regionCollection
      .find({
        _id: { $in: regionIds },
        is_active: { $ne: false },
      })
      .toArray();

    // Preserve recent order
    const byId = new Map(regions.map((r) => [r._id.toString(), r]));
    const ordered = regionIds
      .map((id) => byId.get(id.toString()))
      .filter(Boolean)
      .map(formatRegion);

    res.json({
      success: true,
      data: ordered,
    });
  } catch (error) {
    console.error('Error fetching recent regions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent regions',
      error: error.message,
    });
  }
};

// Add region to user's recent regions
exports.addRecentRegion = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { regionId } = req.body;

    const userIdObj = toObjectId(userId);
    if (!userIdObj) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const regionIdObj = toObjectId(regionId);
    if (!regionIdObj) {
      return res.status(400).json({
        success: false,
        message: 'Valid region ID is required',
      });
    }

    const regionCollection = await getCollection('Region');
    const region = await regionCollection.findOne({
      _id: regionIdObj,
      is_active: { $ne: false },
    });
    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    const userRecentRegionCollection = await getCollection('UserRecentRegion');

    const existing = await userRecentRegionCollection.findOne({
      $or: [
        { user_id: userIdObj, region_id: regionIdObj },
        { user_id: String(userId), region_id: regionIdObj },
      ],
    });

    if (existing) {
      await userRecentRegionCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            user_id: userIdObj,
            region_id: regionIdObj,
            last_used_at: new Date(),
          },
        }
      );
    } else {
      await userRecentRegionCollection.insertOne({
        user_id: userIdObj,
        region_id: regionIdObj,
        last_used_at: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Region added to recent',
    });
  } catch (error) {
    console.error('Error adding recent region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add recent region',
      error: error.message,
    });
  }
};
