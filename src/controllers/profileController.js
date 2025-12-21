/**
 * Profile Controller
 * Handles user profile, browsing history, and wishlist
 */

const { prisma } = require('../lib/prisma');
const { getUserId } = require('../helpers/userHelper');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        profileImageUrl: true,
        isVerified: true,
        // createdAt removed - some users have null values in DB
        _count: {
          select: {
            listings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// Get browsing history
exports.getBrowsingHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      prisma.browsingHistory.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              photos: {
                where: { isPrimary: true },
                take: 1,
              },
              category: true,
            },
          },
        },
        orderBy: {
          viewedAt: 'desc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.browsingHistory.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching browsing history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch browsing history',
      error: error.message,
    });
  }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
            category: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: wishlist.map((w) => w.listing),
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message,
    });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { listingId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID is required',
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId,
        listingId,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Listing already in wishlist',
      });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        listingId,
      },
      include: {
        listing: true,
      },
    });

    res.status(201).json({
      success: true,
      data: wishlistItem,
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message,
    });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { listingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        listingId,
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist',
      });
    }

    await prisma.wishlist.delete({
      where: { id: wishlistItem.id },
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message,
    });
  }
};

// Get user's listings
exports.getMyListings = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId,
      ...(status && { status }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
          category: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message,
    });
  }
};

