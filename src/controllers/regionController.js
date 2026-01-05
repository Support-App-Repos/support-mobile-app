/**
 * Region Controller
 * Handles region-related endpoints
 * Uses MongoDB directly to bypass Prisma's replica set requirement
 */

const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');

// Get all regions
exports.getRegions = async (req, res) => {
  try {
    const { search } = req.query;
    const regionCollection = await getCollection('Region');

    // Build query
    const query = {
      is_active: { $ne: false }, // Active regions (true or not set)
    };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    const regions = await regionCollection
      .find(query)
      .sort({ country: 1, name: 1 }) // Sort by country, then name (ascending)
      .toArray();

    // Format regions for response (convert _id to id, camelCase fields)
    const formattedRegions = regions.map((region) => ({
      id: region._id.toString(),
      name: region.name,
      country: region.country,
      countryCode: region.country_code || null,
      isActive: region.is_active !== false,
      createdAt: region.created_at,
      updatedAt: region.updated_at,
    }));

    res.json({
      success: true,
      data: formattedRegions,
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
    if (!userId) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const userRecentRegionCollection = await getCollection('UserRecentRegion');
    const regionCollection = await getCollection('Region');

    // Get recent regions for user
    const recentRegions = await userRecentRegionCollection
      .find({
        user_id: new ObjectId(userId),
      })
      .sort({ last_used_at: -1 }) // Descending order
      .limit(5)
      .toArray();

    // Get full region data for each recent region
    const regionIds = recentRegions.map((ur) => ur.region_id);
    const regions = await regionCollection
      .find({
        _id: { $in: regionIds },
        is_active: { $ne: false },
      })
      .toArray();

    // Format regions for response
    const formattedRegions = regions.map((region) => ({
      id: region._id.toString(),
      name: region.name,
      country: region.country,
      countryCode: region.country_code || null,
      isActive: region.is_active !== false,
    }));

    res.json({
      success: true,
      data: formattedRegions,
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

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!regionId) {
      return res.status(400).json({
        success: false,
        message: 'Region ID is required',
      });
    }

    const userRecentRegionCollection = await getCollection('UserRecentRegion');

    // Check if already exists
    const existing = await userRecentRegionCollection.findOne({
      user_id: new ObjectId(userId),
      region_id: new ObjectId(regionId),
    });

    if (existing) {
      // Update last used time
      await userRecentRegionCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            last_used_at: new Date(),
          },
        }
      );
    } else {
      // Create new
      await userRecentRegionCollection.insertOne({
        user_id: new ObjectId(userId),
        region_id: new ObjectId(regionId),
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

