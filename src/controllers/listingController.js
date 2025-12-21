/**
 * Listing Controller
 * Handles listing creation, updates, and retrieval
 * Uses MongoDB directly for writes to bypass replica set requirement
 */

const { prisma } = require('../lib/prisma');
const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const {
      // Common fields
      title,
      description,
      price,
      priceType,
      location,
      city,
      venue,
      categoryId,
      eventTypeId,
      serviceTypeId,
      // Event-specific fields
      eventDate,
      eventTime,
      duration,
      maxCapacity,
      organizerName,
      organizerContact,
      organizerEmail,
      tags,
      // Service-specific fields
      businessName,
      specialization,
      yearsOfExperience,
      // Property-specific fields
      bedrooms,
      bathrooms,
      squareFeet,
      yearBuilt,
      // Photos
      photos,
      // Regions
      regionIds,
    } = req.body;

    // Validate basic required fields
    if (!title || !description || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    // Get MongoDB collections
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const listingRegionCollection = await getCollection('ListingRegion');
    const categoryCollection = await getCollection('Category');

    // Get category to determine listing type and validation rules
    const { ObjectId } = require('mongodb');
    const categoryIdObj = new ObjectId(categoryId);
    const category = await categoryCollection.findOne({ _id: categoryIdObj });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const categorySlug = category.slug?.toLowerCase() || category.name?.toLowerCase() || '';

    // Type-specific validation
    let validationErrors = [];

    // Common validation
    if (!title.trim()) {
      validationErrors.push('Title is required');
    }
    if (!description.trim()) {
      validationErrors.push('Description is required');
    }

    // Category-specific validation
    if (categorySlug.includes('event')) {
      // Events: location/venue is required
      if (!location?.trim() && !venue?.trim()) {
        validationErrors.push('Location or venue is required for events');
      }
      // EventTypeId is optional but recommended
      // Note: We'll allow listings without eventTypeId for flexibility
    } else if (categorySlug.includes('service')) {
      // Services: businessName is required (used as title)
      if (!businessName?.trim()) {
        validationErrors.push('Business name is required for service listings');
      }
      // ServiceTypeId is optional but recommended
      // Note: We'll allow listings without serviceTypeId for flexibility
    } else if (categorySlug.includes('product')) {
      // Products: location is required
      if (!location?.trim()) {
        validationErrors.push('Location is required for product listings');
      }
    } else if (categorySlug.includes('propert')) {
      // Properties: location is required
      if (!location?.trim()) {
        validationErrors.push('Location is required for property listings');
      }
    } else {
      // Default: location is required for unknown categories
      if (!location?.trim()) {
        validationErrors.push('Location is required');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Helper to safely convert to ObjectId
    const toObjectId = (id) => {
      if (!id) return null;
      try {
        return id instanceof ObjectId ? id : new ObjectId(id);
      } catch (error) {
        console.error('Invalid ObjectId:', id, error);
        return null;
      }
    };
    
    const userIdObj = toObjectId(userId);
    const eventTypeIdObj = toObjectId(eventTypeId);
    const serviceTypeIdObj = toObjectId(serviceTypeId);
    
    if (!userIdObj) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Create listing using MongoDB directly
    // Determine final location based on category type
    let finalLocation = '';
    if (categorySlug.includes('event')) {
      // For events: use venue or location
      finalLocation = location?.trim() || venue?.trim() || 'TBD';
    } else if (categorySlug.includes('service')) {
      // For services: location is optional, use business name or default
      finalLocation = location?.trim() || businessName?.trim() || 'Service Location';
    } else {
      // For products and properties: location is required
      finalLocation = location?.trim() || 'Location TBD';
    }
    
    const listingData = {
      title: title.trim(),
      description: description.trim(),
      price: price ? parseFloat(price) : null,
      price_type: priceType || null,
      location: finalLocation,
      city: city?.trim() || null,
      venue: venue?.trim() || null,
      user_id: userIdObj,
      category_id: categoryIdObj,
      event_type_id: eventTypeIdObj,
      service_type_id: serviceTypeIdObj,
      // Event fields
      event_date: eventDate ? new Date(eventDate) : null,
      event_time: eventTime || null,
      duration: duration || null,
      max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
      organizer_name: organizerName || null,
      organizer_contact: organizerContact || null,
      organizer_email: organizerEmail || null,
      tags: tags || null,
      // Service fields
      business_name: businessName || null,
      specialization: specialization || null,
      years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
      // Property fields
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      square_feet: squareFeet ? parseInt(squareFeet) : null,
      year_built: yearBuilt ? parseInt(yearBuilt) : null,
      status: 'draft',
      views_count: 0,
      rating_average: 0,
      reviews_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await listingCollection.insertOne(listingData);
    const listingId = result.insertedId;

    // Add photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const photoData = photos.map((photoUrl, index) => ({
        listing_id: listingId,
        photo_url: photoUrl,
        photo_order: index,
        is_primary: index === 0,
        created_at: new Date(),
      }));
      await listingPhotoCollection.insertMany(photoData);
    }

    // Add regions if provided
    if (regionIds && Array.isArray(regionIds) && regionIds.length > 0) {
      const regionData = regionIds.map((regionId) => ({
        listing_id: listingId,
        region_id: new ObjectId(regionId),
        created_at: new Date(),
      }));
      await listingRegionCollection.insertMany(regionData);
    }

    // Fetch complete listing with relations using Prisma (for reads)
    try {
      const listingWithRelations = await prisma.listing.findUnique({
        where: { id: listingId.toString() },
        include: {
          photos: {
            orderBy: { photoOrder: 'asc' },
          },
          listingRegions: {
            include: {
              region: true,
            },
          },
          category: true,
          eventType: true,
          serviceType: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profileImageUrl: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: listingWithRelations,
      });
    } catch (prismaError) {
      // If Prisma fails, return basic listing data
      const listingDoc = await listingCollection.findOne({ _id: listingId });
      const listingPhotos = await listingPhotoCollection.find({ listing_id: listingId }).sort({ photo_order: 1 }).toArray();
      const listingRegions = await listingRegionCollection.find({ listing_id: listingId }).toArray();
      
      // Get related data
      const categoryCollection = await getCollection('Category');
      const userCollection = await getCollection('User');
      const category = await categoryCollection.findOne({ _id: categoryIdObj });
      const user = await userCollection.findOne({ _id: userIdObj });
      
      const listingWithRelations = {
        id: listingDoc._id.toString(),
        title: listingDoc.title,
        description: listingDoc.description,
        price: listingDoc.price,
        priceType: listingDoc.price_type,
        location: listingDoc.location,
        city: listingDoc.city,
        venue: listingDoc.venue,
        status: listingDoc.status,
        photos: listingPhotos.map(p => ({
          id: p._id.toString(),
          photoUrl: p.photo_url,
          photoOrder: p.photo_order,
          isPrimary: p.is_primary,
        })),
        listingRegions: listingRegions.map(lr => ({
          id: lr._id.toString(),
          regionId: lr.region_id.toString(),
        })),
        category: category ? {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
        } : null,
        user: user ? {
          id: user._id.toString(),
          fullName: user.full_name,
          profileImageUrl: user.profile_image_url,
        } : null,
      };

      res.status(201).json({
        success: true,
        data: listingWithRelations,
      });
    }
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: error.message,
    });
  }
};

// Get listing by ID
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { photoOrder: 'asc' },
        },
        category: true,
        eventType: true,
        serviceType: true,
        listingRegions: {
          include: {
            region: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 },
      },
    });

    // Add to browsing history if user is authenticated
    const userId = getUserId(req);
    if (userId) {
      await prisma.browsingHistory.create({
        data: {
          userId,
          listingId: id,
        },
      });
    }

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing',
      error: error.message,
    });
  }
};

// Get all listings with filters
exports.getListings = async (req, res) => {
  try {
    const {
      categoryId,
      status = 'published',
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status,
      ...(categoryId && { categoryId }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {}),
      ...(location && { location: { contains: location } }),
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
          user: {
            select: {
              id: true,
              fullName: true,
              profileImageUrl: true,
            },
          },
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
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message,
    });
  }
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if listing belongs to user
    const existingListing = await prisma.listing.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or access denied',
      });
    }

    const updateData = { ...req.body };
    delete updateData.photos; // Handle photos separately
    delete updateData.regionIds; // Handle regions separately

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.maxCapacity) updateData.maxCapacity = parseInt(updateData.maxCapacity);
    if (updateData.yearsOfExperience) updateData.yearsOfExperience = parseInt(updateData.yearsOfExperience);
    if (updateData.bedrooms) updateData.bedrooms = parseInt(updateData.bedrooms);
    if (updateData.bathrooms) updateData.bathrooms = parseInt(updateData.bathrooms);
    if (updateData.squareFeet) updateData.squareFeet = parseInt(updateData.squareFeet);
    if (updateData.yearBuilt) updateData.yearBuilt = parseInt(updateData.yearBuilt);

    // Convert date fields
    if (updateData.eventDate) updateData.eventDate = new Date(updateData.eventDate);

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        photos: true,
        category: true,
      },
    });

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update listing',
      error: error.message,
    });
  }
};

// Publish listing
exports.publishListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if listing belongs to user
    const listing = await prisma.listing.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or access denied',
      });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
      include: {
        photos: true,
        category: true,
        listingRegions: {
          include: {
            region: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedListing,
      message: 'Listing published successfully',
    });
  } catch (error) {
    console.error('Error publishing listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish listing',
      error: error.message,
    });
  }
};

