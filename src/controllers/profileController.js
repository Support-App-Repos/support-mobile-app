/**
 * Profile Controller
 * Handles user profile, browsing history, and wishlist
 */

const { prisma } = require('../lib/prisma');
const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');

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

    // Split fullName into firstName and lastName
    const fullName = user.fullName || '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      success: true,
      data: {
        ...user,
        firstName: firstName,
        lastName: lastName,
        profileImage: user.profileImageUrl, // Add profileImage alias
      },
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

    // Use raw MongoDB to avoid Prisma namespace issues
    const browsingHistoryCollection = await getCollection('BrowsingHistory');
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');

    const userIdObj = new ObjectId(userId);

    // Get browsing history records
    const historyRecords = await browsingHistoryCollection
      .find({ user_id: userIdObj })
      .sort({ viewed_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const total = await browsingHistoryCollection.countDocuments({ user_id: userIdObj });

    // Fetch listing details for each history record
    const history = await Promise.all(
      historyRecords.map(async (record) => {
        const listingIdObj = record.listing_id instanceof ObjectId 
          ? record.listing_id 
          : new ObjectId(record.listing_id);

        // Get listing
        const listing = await listingCollection.findOne({ _id: listingIdObj });
        if (!listing) {
          return null;
        }

        // Get primary photo
        const primaryPhoto = await listingPhotoCollection.findOne({
          listing_id: listingIdObj,
          is_primary: true,
        });

        // Get category
        const categoryId = listing.category_id || listing.categoryId;
        let category = null;
        if (categoryId) {
          const categoryIdObj = categoryId instanceof ObjectId 
            ? categoryId 
            : new ObjectId(categoryId);
          const cat = await categoryCollection.findOne({ _id: categoryIdObj });
          if (cat) {
            category = {
              id: cat._id.toString(),
              name: cat.name,
              slug: cat.slug,
              iconUrl: cat.icon_url || null,
              description: cat.description || null,
              isActive: cat.is_active !== false,
            };
          }
        }

        // Format listing
        const formattedListing = {
          id: listing._id.toString(),
          title: listing.title,
          description: listing.description,
          price: listing.price || null,
          priceType: listing.price_type || null,
          currency: listing.currency || null,
          location: listing.location,
          city: listing.city || null,
          status: listing.status,
          viewsCount: listing.views_count || 0,
          ratingAverage: listing.rating_average || 0,
          reviewsCount: listing.reviews_count || 0,
          category,
          photos: primaryPhoto ? [{
            id: primaryPhoto._id.toString(),
            photoUrl: primaryPhoto.photo_url,
            isPrimary: primaryPhoto.is_primary || false,
          }] : [],
        };

        return {
          id: record._id.toString(),
          userId: record.user_id.toString(),
          listingId: listingIdObj.toString(),
          viewedAt: record.viewed_at || record.viewedAt,
          viewDuration: record.view_duration || record.viewDuration || null,
          listing: formattedListing,
        };
      })
    );

    // Filter out null values (deleted listings)
    const validHistory = history.filter(h => h !== null);

    res.json({
      success: true,
      data: validHistory,
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

    const wishlistCollection = await getCollection('Wishlist');
    const userIdObj = new ObjectId(userId);
    const listingIdObj = new ObjectId(listingId);

    // Check if already in wishlist using MongoDB
    const existing = await wishlistCollection.findOne({
      user_id: userIdObj,
      listing_id: listingIdObj,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Listing already in wishlist',
      });
    }

    // Create wishlist item using MongoDB
    const result = await wishlistCollection.insertOne({
      user_id: userIdObj,
      listing_id: listingIdObj,
      created_at: new Date(),
    });

    // Fetch the created item
    const wishlistItem = await wishlistCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      success: true,
      data: {
        id: wishlistItem._id.toString(),
        userId: wishlistItem.user_id.toString(),
        listingId: wishlistItem.listing_id.toString(),
        createdAt: wishlistItem.created_at,
      },
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

    const wishlistCollection = await getCollection('Wishlist');
    const userIdObj = new ObjectId(userId);
    const listingIdObj = new ObjectId(listingId);

    // Find and delete wishlist item using MongoDB
    const result = await wishlistCollection.deleteOne({
      user_id: userIdObj,
      listing_id: listingIdObj,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist',
      });
    }

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

// Get user's listings (shows all statuses: Active, Pending, Rejected, Expired)
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

    const { getCollection } = require('../lib/mongodb');
    const { userIdFilter } = require('../helpers/mongoId');

    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');
    const reviewCollection = await getCollection('Review');

    // Build query - show all statuses for user's own listings
    const query = {
      ...userIdFilter(userId),
    };

    // Filter by status if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    // Get listings
    const listings = await listingCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const total = await listingCollection.countDocuments(query);

    // Get photos and related data for each listing
    const listingsWithRelations = await Promise.all(
      listings.map(async (listing) => {
        // Get primary photo
        const primaryPhoto = await listingPhotoCollection.findOne({
          listing_id: listing._id,
          is_primary: true,
        });

        // Get category
        const category = listing.category_id
          ? await categoryCollection.findOne({ _id: listing.category_id })
          : null;

        // Get review count
        const reviewCount = await reviewCollection.countDocuments({
          listing_id: listing._id,
        });

        return {
          id: listing._id.toString(),
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceType: listing.price_type,
          currency: listing.currency,
          location: listing.location,
          city: listing.city,
          venue: listing.venue,
          status: listing.status, // Shows all statuses: Active, Pending, Rejected, Expired
          viewsCount: listing.views_count || 0,
          ratingAverage: listing.rating_average || 0,
          reviewsCount: reviewCount,
          publishedAt: listing.published_at,
          createdAt: listing.created_at,
          updatedAt: listing.updated_at,
          photos: primaryPhoto ? [{
            id: primaryPhoto._id.toString(),
            photoUrl: primaryPhoto.photo_url,
            isPrimary: primaryPhoto.is_primary,
          }] : [],
          category: category ? {
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            iconUrl: category.icon_url,
          } : null,
          _count: {
            reviews: reviewCount,
          },
        };
      })
    );

    res.json({
      success: true,
      data: listingsWithRelations,
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

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { getCollection } = require('../lib/mongodb');
    const userCollection = await getCollection('User');
    const storeCollection = await getCollection('Store');

    const query = {};
    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ email: regex }, { full_name: regex }, { phone_number: regex }];
    }

    const users = await userCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await userCollection.countDocuments(query);

    const userIds = users.map((u) => u._id);
    const stores = userIds.length
      ? await storeCollection.find({ user_id: { $in: userIds } }).toArray()
      : [];
    const storeCountMap = new Map();
    stores.forEach((s) => {
      const uid = s.user_id.toString();
      storeCountMap.set(uid, (storeCountMap.get(uid) || 0) + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await userCollection.countDocuments({
      created_at: { $gte: today },
    });
    const storeOwners = await storeCollection.distinct('user_id');
    const buyers = Math.max(0, total - storeOwners.length);

    const formattedUsers = users.map((user) => {
      const storeCount = storeCountMap.get(user._id.toString()) || 0;
      return {
        id: user._id.toString(),
        email: user.email,
        phoneNumber: user.phone_number,
        fullName: user.full_name,
        profileImage: user.profile_image_url,
        profileImageUrl: user.profile_image_url,
        isVerified: user.is_verified !== false,
        isActive: user.is_active !== false,
        storeCount,
        role: storeCount > 0 ? 'Store Owner' : 'Buyer',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    });

    res.json({
      success: true,
      data: formattedUsers,
      stats: {
        totalUsers: total,
        storeOwners: storeOwners.length,
        buyers,
        newToday,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const { getCollection } = require('../lib/mongodb');
    const { ObjectId } = require('mongodb');
    const userCollection = await getCollection('User');

    const userIdObj = new ObjectId(id);

    // Check if user exists
    const existingUser = await userCollection.findOne({ _id: userIdObj });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Build update object with snake_case field names
    const mongoUpdateData = {
      updated_at: new Date(),
    };

    // Map camelCase to snake_case for MongoDB
    if (updateData.email !== undefined) {
      mongoUpdateData.email = updateData.email.toLowerCase();
    }
    if (updateData.phoneNumber !== undefined) {
      mongoUpdateData.phone_number = updateData.phoneNumber || null;
    }
    if (updateData.fullName !== undefined) {
      mongoUpdateData.full_name = updateData.fullName || null;
    }
    if (updateData.isVerified !== undefined) {
      mongoUpdateData.is_verified = updateData.isVerified;
    }
    if (updateData.isActive !== undefined) {
      mongoUpdateData.is_active = updateData.isActive;
    }
    // Handle profileImage and profileImageUrl (both map to profile_image_url)
    if (updateData.profileImage !== undefined) {
      mongoUpdateData.profile_image_url = updateData.profileImage?.trim() || null;
    }
    if (updateData.profileImageUrl !== undefined) {
      mongoUpdateData.profile_image_url = updateData.profileImageUrl?.trim() || null;
    }

    // Update user
    await userCollection.updateOne(
      { _id: userIdObj },
      { $set: mongoUpdateData }
    );

    // Fetch updated user
    const updatedUser = await userCollection.findOne({ _id: userIdObj });

    // Format response
    const formattedUser = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      phoneNumber: updatedUser.phone_number,
      fullName: updatedUser.full_name,
      profileImage: updatedUser.profile_image_url,
      profileImageUrl: updatedUser.profile_image_url, // Keep for backward compatibility
      isVerified: updatedUser.is_verified !== false,
      isActive: updatedUser.is_active !== false,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };

    res.json({
      success: true,
      data: formattedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const updateData = req.body;
    const userCollection = await getCollection('User');
    const userIdObj = new ObjectId(userId);

    // Check if user exists
    const existingUser = await userCollection.findOne({ _id: userIdObj });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Build update object with snake_case field names
    const mongoUpdateData = {
      updated_at: new Date(),
    };

    // Map camelCase to snake_case for MongoDB
    if (updateData.email !== undefined) {
      mongoUpdateData.email = updateData.email.toLowerCase().trim();
    }
    if (updateData.phoneNumber !== undefined) {
      mongoUpdateData.phone_number = updateData.phoneNumber?.trim() || null;
    }
    // Handle firstName and lastName - combine into full_name
    if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
      const firstName = updateData.firstName?.trim() || '';
      const lastName = updateData.lastName?.trim() || '';
      mongoUpdateData.full_name = `${firstName} ${lastName}`.trim() || null;
      // Also store separately if fields exist in DB
      if (updateData.firstName !== undefined) {
        mongoUpdateData.first_name = firstName || null;
      }
      if (updateData.lastName !== undefined) {
        mongoUpdateData.last_name = lastName || null;
      }
    }
    // Keep backward compatibility with fullName
    if (updateData.fullName !== undefined) {
      mongoUpdateData.full_name = updateData.fullName?.trim() || null;
    }
    // Handle profileImage and profileImageUrl (both map to profile_image_url)
    if (updateData.profileImage !== undefined && updateData.profileImage !== null && updateData.profileImage !== '') {
      mongoUpdateData.profile_image_url = updateData.profileImage.trim();
    } else if (updateData.profileImageUrl !== undefined && updateData.profileImageUrl !== null && updateData.profileImageUrl !== '') {
      mongoUpdateData.profile_image_url = updateData.profileImageUrl.trim();
    }

    console.log('[UpdateProfile] MongoDB update data:', JSON.stringify(mongoUpdateData, null, 2));

    // Update user
    const updateResult = await userCollection.updateOne(
      { _id: userIdObj },
      { $set: mongoUpdateData }
    );

    console.log('[UpdateProfile] Update result - Modified:', updateResult.modifiedCount, 'Matched:', updateResult.matchedCount);

    // Fetch updated user
    const updatedUser = await userCollection.findOne({ _id: userIdObj });

    // Format response - split full_name into firstName and lastName if possible
    const fullName = updatedUser.full_name || '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = updatedUser.first_name || nameParts[0] || '';
    const lastName = updatedUser.last_name || nameParts.slice(1).join(' ') || '';

    const formattedUser = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      phoneNumber: updatedUser.phone_number,
      fullName: updatedUser.full_name,
      firstName: firstName,
      lastName: lastName,
      profileImage: updatedUser.profile_image_url,
      profileImageUrl: updatedUser.profile_image_url, // Keep for backward compatibility
      isVerified: updatedUser.is_verified !== false,
      isActive: updatedUser.is_active !== false,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };

    res.json({
      success: true,
      data: formattedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let userIdObj;
    try {
      userIdObj = new ObjectId(userId);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const userCollection = await getCollection('User');
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const listingRegionCollection = await getCollection('ListingRegion');
    const reviewCollection = await getCollection('Review');
    const wishlistCollection = await getCollection('Wishlist');
    const browsingHistoryCollection = await getCollection('BrowsingHistory');
    const subscriptionCollection = await getCollection('Subscription');
    const notificationCollection = await getCollection('Notification');
    const storeCollection = await getCollection('Store');
    const storeDocumentCollection = await getCollection('StoreDocument');
    const userRecentRegionCollection = await getCollection('UserRecentRegion');

    const user = await userCollection.findOne({ _id: userIdObj });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userListings = await listingCollection
      .find({ user_id: userIdObj })
      .project({ _id: 1 })
      .toArray();
    const listingIds = userListings.map((listing) => listing._id);

    if (listingIds.length > 0) {
      await listingPhotoCollection.deleteMany({ listing_id: { $in: listingIds } });
      await listingRegionCollection.deleteMany({ listing_id: { $in: listingIds } });
      await reviewCollection.deleteMany({ listing_id: { $in: listingIds } });
      await wishlistCollection.deleteMany({ listing_id: { $in: listingIds } });
      await browsingHistoryCollection.deleteMany({ listing_id: { $in: listingIds } });
      await subscriptionCollection.deleteMany({ listing_id: { $in: listingIds } });
      await listingCollection.deleteMany({ _id: { $in: listingIds } });
    }

    await reviewCollection.deleteMany({ user_id: userIdObj });
    await wishlistCollection.deleteMany({ user_id: userIdObj });
    await browsingHistoryCollection.deleteMany({ user_id: userIdObj });
    await subscriptionCollection.deleteMany({ user_id: userIdObj });
    await notificationCollection.deleteMany({ user_id: userIdObj });
    await userRecentRegionCollection.deleteMany({ user_id: userIdObj });

    const stores = await storeCollection
      .find({ user_id: userIdObj })
      .project({ _id: 1 })
      .toArray();
    const storeIds = stores.map((store) => store._id);

    if (storeIds.length > 0) {
      await storeDocumentCollection.deleteMany({ store_id: { $in: storeIds } });
      await storeCollection.deleteMany({ _id: { $in: storeIds } });
    }

    await userCollection.deleteOne({ _id: userIdObj });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
};

