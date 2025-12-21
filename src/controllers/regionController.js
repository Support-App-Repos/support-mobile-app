/**
 * Region Controller
 * Handles region-related endpoints
 */

const { prisma } = require('../lib/prisma');
const { getUserId } = require('../helpers/userHelper');

// Get all regions
exports.getRegions = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { country: { contains: search } },
        ],
      }),
    };

    const regions = await prisma.region.findMany({
      where,
      orderBy: [
        { country: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: regions,
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

    const recentRegions = await prisma.userRecentRegion.findMany({
      where: {
        userId,
      },
      include: {
        region: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
      take: 5,
    });

    res.json({
      success: true,
      data: recentRegions.map((ur) => ur.region),
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

    // Check if already exists
    const existing = await prisma.userRecentRegion.findFirst({
      where: {
        userId,
        regionId,
      },
    });

    if (existing) {
      // Update last used time
      await prisma.userRecentRegion.update({
        where: { id: existing.id },
        data: { lastUsedAt: new Date() },
      });
    } else {
      // Create new
      await prisma.userRecentRegion.create({
        data: {
          userId,
          regionId,
          lastUsedAt: new Date(),
        },
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

