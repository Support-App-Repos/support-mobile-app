/**
 * Listing Controller
 * Handles listing creation, updates, and retrieval
 * Uses MongoDB directly for writes to bypass replica set requirement
 */

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
      status: 'Pending',
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

    // Fetch complete listing with relations using MongoDB directly
    const listingDoc = await listingCollection.findOne({ _id: listingId });
    const listingPhotos = await listingPhotoCollection.find({ listing_id: listingId }).sort({ photo_order: 1 }).toArray();
    const listingRegions = await listingRegionCollection.find({ listing_id: listingId }).toArray();
    
    // Get related data
    const userCollection = await getCollection('User');
    const regionCollection = await getCollection('Region');
    const eventTypeCollection = await getCollection('EventType');
    const serviceTypeCollection = await getCollection('ServiceType');
    
    const user = await userCollection.findOne({ _id: userIdObj });
    
    // Get regions for listingRegions
    const regionsWithDetails = await Promise.all(
      listingRegions.map(async (lr) => {
        const region = lr.region_id 
          ? await regionCollection.findOne({ _id: lr.region_id })
          : null;
        return {
          id: lr._id.toString(),
          regionId: lr.region_id.toString(),
          region: region ? {
            id: region._id.toString(),
            name: region.name,
            country: region.country,
            countryCode: region.country_code,
          } : null,
        };
      })
    );
    
    // Get event type if applicable
    const eventType = eventTypeIdObj
      ? await eventTypeCollection.findOne({ _id: eventTypeIdObj })
      : null;
    
    // Get service type if applicable
    const serviceType = serviceTypeIdObj
      ? await serviceTypeCollection.findOne({ _id: serviceTypeIdObj })
      : null;
    
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
      createdAt: listingDoc.created_at,
      updatedAt: listingDoc.updated_at,
      eventDate: listingDoc.event_date,
      eventTime: listingDoc.event_time,
      duration: listingDoc.duration,
      maxCapacity: listingDoc.max_capacity,
      organizerName: listingDoc.organizer_name,
      organizerContact: listingDoc.organizer_contact,
      organizerEmail: listingDoc.organizer_email,
      tags: listingDoc.tags,
      businessName: listingDoc.business_name,
      specialization: listingDoc.specialization,
      yearsOfExperience: listingDoc.years_of_experience,
      bedrooms: listingDoc.bedrooms,
      bathrooms: listingDoc.bathrooms,
      squareFeet: listingDoc.square_feet,
      yearBuilt: listingDoc.year_built,
      photos: listingPhotos.map(p => ({
        id: p._id.toString(),
        photoUrl: p.photo_url,
        photoOrder: p.photo_order,
        isPrimary: p.is_primary,
      })),
      listingRegions: regionsWithDetails,
      category: category ? {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        iconUrl: category.icon_url,
        description: category.description,
        isActive: category.is_active,
      } : null,
      eventType: eventType ? {
        id: eventType._id.toString(),
        name: eventType.name,
        slug: eventType.slug,
      } : null,
      serviceType: serviceType ? {
        id: serviceType._id.toString(),
        name: serviceType.name,
        slug: serviceType.slug,
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
    const { getCollection } = require('../lib/mongodb');
    const { ObjectId } = require('mongodb');

    const listingIdObj = new ObjectId(id);

    // Get collections
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');
    const eventTypeCollection = await getCollection('EventType');
    const serviceTypeCollection = await getCollection('ServiceType');
    const listingRegionCollection = await getCollection('ListingRegion');
    const regionCollection = await getCollection('Region');
    const userCollection = await getCollection('User');
    const reviewCollection = await getCollection('Review');
    const browsingHistoryCollection = await getCollection('BrowsingHistory');

    // Find listing
    const listing = await listingCollection.findOne({ _id: listingIdObj });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Increment view count using MongoDB directly
    await listingCollection.updateOne(
      { _id: listingIdObj },
      { $inc: { views_count: 1 } }
    );

    // Add to browsing history if user is authenticated
    const userId = getUserId(req);
    if (userId) {
      const userIdObj = new ObjectId(userId);
      // Check if browsing history already exists for this user and listing
      const existingHistory = await browsingHistoryCollection.findOne({
        user_id: userIdObj,
        listing_id: listingIdObj,
      });

      if (!existingHistory) {
        await browsingHistoryCollection.insertOne({
          user_id: userIdObj,
          listing_id: listingIdObj,
          viewed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // Update viewed_at timestamp
        await browsingHistoryCollection.updateOne(
          { _id: existingHistory._id },
          { $set: { viewed_at: new Date(), updated_at: new Date() } }
        );
      }
    }

    // Fetch related data manually
    const photos = await listingPhotoCollection.find({ listing_id: listingIdObj })
      .sort({ photo_order: 1 })
      .toArray();

    const category = listing.category_id
      ? await categoryCollection.findOne({ _id: listing.category_id })
      : null;

    const eventType = listing.event_type_id
      ? await eventTypeCollection.findOne({ _id: listing.event_type_id })
      : null;

    const serviceType = listing.service_type_id
      ? await serviceTypeCollection.findOne({ _id: listing.service_type_id })
      : null;

    const listingRegions = await listingRegionCollection.find({ listing_id: listingIdObj }).toArray();
    const regions = await Promise.all(
      listingRegions.map(async (lr) => {
        const region = await regionCollection.findOne({ _id: lr.region_id });
        return {
          id: lr._id.toString(),
          regionId: lr.region_id.toString(),
          region: region ? {
            id: region._id.toString(),
            name: region.name,
            country: region.country,
            countryCode: region.country_code,
          } : null,
        };
      })
    );

    const user = listing.user_id
      ? await userCollection.findOne({ _id: listing.user_id })
      : null;

    // Get reviews with user data
    const reviews = await reviewCollection.find({ listing_id: listingIdObj })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const reviewUser = review.user_id
          ? await userCollection.findOne({ _id: review.user_id })
          : null;
        return {
          id: review._id.toString(),
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          user: reviewUser ? {
            id: reviewUser._id.toString(),
            fullName: reviewUser.full_name,
            profileImageUrl: reviewUser.profile_image_url,
          } : null,
        };
      })
    );

    // Count reviews and wishlist items
    const reviewsCount = await reviewCollection.countDocuments({ listing_id: listingIdObj });
    // Note: Wishlist count would need a WishlistItem collection if it exists

    // Format response to match Prisma structure
    const formattedListing = {
      id: listing._id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      priceType: listing.price_type,
      location: listing.location,
      city: listing.city,
      venue: listing.venue,
      status: listing.status,
      viewsCount: (listing.views_count || 0) + 1, // Include incremented count
      ratingAverage: listing.rating_average,
      reviewsCount: reviewsCount,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      publishedAt: listing.published_at,
      eventDate: listing.event_date,
      eventTime: listing.event_time,
      duration: listing.duration,
      maxCapacity: listing.max_capacity,
      organizerName: listing.organizer_name,
      organizerContact: listing.organizer_contact,
      organizerEmail: listing.organizer_email,
      tags: listing.tags,
      businessName: listing.business_name,
      specialization: listing.specialization,
      yearsOfExperience: listing.years_of_experience,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareFeet: listing.square_feet,
      yearBuilt: listing.year_built,
      photos: photos.map(p => ({
        id: p._id.toString(),
        photoUrl: p.photo_url,
        photoOrder: p.photo_order,
        isPrimary: p.is_primary,
      })),
      category: category ? {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        iconUrl: category.icon_url,
        description: category.description,
        isActive: category.is_active,
      } : null,
      eventType: eventType ? {
        id: eventType._id.toString(),
        name: eventType.name,
        slug: eventType.slug,
      } : null,
      serviceType: serviceType ? {
        id: serviceType._id.toString(),
        name: serviceType.name,
        slug: serviceType.slug,
      } : null,
      listingRegions: regions,
      user: user ? {
        id: user._id.toString(),
        fullName: user.full_name,
        profileImageUrl: user.profile_image_url,
      } : null,
      reviews: reviewsWithUsers,
      _count: {
        reviews: reviewsCount,
        wishlistItems: 0, // Would need to implement if wishlist exists
      },
    };

    res.json({
      success: true,
      data: formattedListing,
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
      status,
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');
    const userCollection = await getCollection('User');
    const reviewCollection = await getCollection('Review');
    const { ObjectId } = require('mongodb');

    // Build MongoDB query
    // For public listings (getListings), only show 'Active' status by default
    // This ensures only approved listings are visible to all users
    const query = {};
    
    // If status is explicitly provided, use it; otherwise default to 'Active' for public view
    if (status) {
      query.status = status;
    } else {
      query.status = 'Active'; // Only show Active listings to public
    }

    if (categoryId) {
      query.category_id = new ObjectId(categoryId);
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
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
        // Get photos (primary first, then others)
        const allPhotos = await listingPhotoCollection
          .find({ listing_id: listing._id })
          .sort({ is_primary: -1, photo_order: 1 })
          .toArray();

        const photos = allPhotos.map(p => ({
          id: p._id.toString(),
          photoUrl: p.photo_url,
          photoOrder: p.photo_order,
          isPrimary: p.is_primary,
        }));

        // Get category
        const category = listing.category_id
          ? await categoryCollection.findOne({ _id: listing.category_id })
          : null;

        // Get user
        const user = listing.user_id
          ? await userCollection.findOne({ _id: listing.user_id })
          : null;

        // Get review count
        const reviewCount = await reviewCollection.countDocuments({ listing_id: listing._id });

        return {
          id: listing._id.toString(),
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceType: listing.price_type,
          location: listing.location,
          city: listing.city,
          venue: listing.venue,
          status: listing.status,
          viewsCount: listing.views_count || 0,
          ratingAverage: listing.rating_average || 0,
          reviewsCount: listing.reviews_count || 0,
          publishedAt: listing.published_at,
          createdAt: listing.created_at,
          updatedAt: listing.updated_at,
          photos: photos,
          category: category ? {
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            iconUrl: category.icon_url,
          } : null,
          user: user ? {
            id: user._id.toString(),
            fullName: user.full_name,
            profileImageUrl: user.profile_image_url,
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

    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const listingRegionCollection = await getCollection('ListingRegion');
    const { ObjectId } = require('mongodb');

    const listingIdObj = new ObjectId(id);
    const userIdObj = new ObjectId(userId);

    // Check if listing belongs to user using MongoDB
    const existingListing = await listingCollection.findOne({
      _id: listingIdObj,
      user_id: userIdObj,
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or access denied',
      });
    }

    const updateData = { ...req.body };
    const regionIds = updateData.regionIds;
    delete updateData.photos; // Handle photos separately
    delete updateData.regionIds; // Handle regions separately

    // Build MongoDB update object with snake_case field names
    const mongoUpdateData = {
      updated_at: new Date(),
    };

    // Map camelCase to snake_case for MongoDB
    if (updateData.title !== undefined) mongoUpdateData.title = updateData.title.trim();
    if (updateData.description !== undefined) mongoUpdateData.description = updateData.description.trim();
    if (updateData.price !== undefined) mongoUpdateData.price = updateData.price ? parseFloat(updateData.price) : null;
    if (updateData.priceType !== undefined) mongoUpdateData.price_type = updateData.priceType;
    if (updateData.location !== undefined) mongoUpdateData.location = updateData.location?.trim();
    if (updateData.city !== undefined) mongoUpdateData.city = updateData.city?.trim() || null;
    if (updateData.venue !== undefined) mongoUpdateData.venue = updateData.venue?.trim() || null;
    
    // Event fields
    if (updateData.eventDate !== undefined) mongoUpdateData.event_date = updateData.eventDate ? new Date(updateData.eventDate) : null;
    if (updateData.eventTime !== undefined) mongoUpdateData.event_time = updateData.eventTime || null;
    if (updateData.duration !== undefined) mongoUpdateData.duration = updateData.duration || null;
    if (updateData.maxCapacity !== undefined) mongoUpdateData.max_capacity = updateData.maxCapacity ? parseInt(updateData.maxCapacity) : null;
    if (updateData.organizerName !== undefined) mongoUpdateData.organizer_name = updateData.organizerName || null;
    if (updateData.organizerContact !== undefined) mongoUpdateData.organizer_contact = updateData.organizerContact || null;
    if (updateData.organizerEmail !== undefined) mongoUpdateData.organizer_email = updateData.organizerEmail || null;
    if (updateData.tags !== undefined) mongoUpdateData.tags = updateData.tags || null;
    
    // Service fields
    if (updateData.businessName !== undefined) mongoUpdateData.business_name = updateData.businessName?.trim() || null;
    if (updateData.specialization !== undefined) mongoUpdateData.specialization = updateData.specialization || null;
    if (updateData.yearsOfExperience !== undefined) mongoUpdateData.years_of_experience = updateData.yearsOfExperience ? parseInt(updateData.yearsOfExperience) : null;
    
    // Property fields
    if (updateData.bedrooms !== undefined) mongoUpdateData.bedrooms = updateData.bedrooms ? parseInt(updateData.bedrooms) : null;
    if (updateData.bathrooms !== undefined) mongoUpdateData.bathrooms = updateData.bathrooms ? parseInt(updateData.bathrooms) : null;
    if (updateData.squareFeet !== undefined) mongoUpdateData.square_feet = updateData.squareFeet ? parseInt(updateData.squareFeet) : null;
    if (updateData.yearBuilt !== undefined) mongoUpdateData.year_built = updateData.yearBuilt ? parseInt(updateData.yearBuilt) : null;

    // Update listing
    await listingCollection.updateOne(
      { _id: listingIdObj },
      { $set: mongoUpdateData }
    );

    // Handle regions update if provided
    if (regionIds && Array.isArray(regionIds) && regionIds.length > 0) {
      // Remove existing regions
      await listingRegionCollection.deleteMany({ listing_id: listingIdObj });
      
      // Add new regions
      const regionData = regionIds.map((regionId) => ({
        listing_id: listingIdObj,
        region_id: new ObjectId(regionId),
        created_at: new Date(),
      }));
      await listingRegionCollection.insertMany(regionData);
    }

    // Get updated listing with relations
    const updatedListing = await listingCollection.findOne({ _id: listingIdObj });
    const listingPhotos = await listingPhotoCollection.find({ listing_id: listingIdObj }).sort({ photo_order: 1 }).toArray();
    const listingRegions = await listingRegionCollection.find({ listing_id: listingIdObj }).toArray();
    
    // Get related data
    const categoryCollection = await getCollection('Category');
    const category = updatedListing.category_id 
      ? await categoryCollection.findOne({ _id: updatedListing.category_id })
      : null;

    // Format response
    const formattedListing = {
      id: updatedListing._id.toString(),
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      priceType: updatedListing.price_type,
      location: updatedListing.location,
      city: updatedListing.city,
      venue: updatedListing.venue,
      status: updatedListing.status,
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
    };

    res.json({
      success: true,
      data: formattedListing,
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

    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const listingRegionCollection = await getCollection('ListingRegion');
    const { ObjectId } = require('mongodb');

    const listingIdObj = new ObjectId(id);
    const userIdObj = new ObjectId(userId);

    // Check if listing belongs to user using MongoDB
    const listing = await listingCollection.findOne({
      _id: listingIdObj,
      user_id: userIdObj,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or access denied',
      });
    }

    // Update listing status to Pending (admin approval required to make it Active)
    await listingCollection.updateOne(
      { _id: listingIdObj },
      {
        $set: {
          status: 'Pending', // Set to Pending - admin approval required to make it Active
          published_at: new Date(),
          updated_at: new Date(),
        },
      }
    );

    // Get updated listing with relations
    const updatedListing = await listingCollection.findOne({ _id: listingIdObj });
    const listingPhotos = await listingPhotoCollection.find({ listing_id: listingIdObj }).sort({ photo_order: 1 }).toArray();
    const listingRegions = await listingRegionCollection.find({ listing_id: listingIdObj }).toArray();
    
    // Get related data
    const categoryCollection = await getCollection('Category');
    const category = updatedListing.category_id 
      ? await categoryCollection.findOne({ _id: updatedListing.category_id })
      : null;

    // Format response
    const formattedListing = {
      id: updatedListing._id.toString(),
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      priceType: updatedListing.price_type,
      location: updatedListing.location,
      city: updatedListing.city,
      venue: updatedListing.venue,
      status: updatedListing.status,
      publishedAt: updatedListing.published_at,
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
    };

    res.json({
      success: true,
      data: formattedListing,
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

// Update listing status (Admin only - for approval/rejection)
exports.updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Active', 'Pending', 'Rejected', 'Expired'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const listingRegionCollection = await getCollection('ListingRegion');
    const categoryCollection = await getCollection('Category');
    const userCollection = await getCollection('User');
    const { ObjectId } = require('mongodb');

    const listingIdObj = new ObjectId(id);

    // Check if listing exists
    const listing = await listingCollection.findOne({ _id: listingIdObj });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Update listing status
    await listingCollection.updateOne(
      { _id: listingIdObj },
      {
        $set: {
          status: status,
          updated_at: new Date(),
          ...(status === 'Active' && { published_at: new Date() }),
        },
      }
    );

    // Get updated listing with relations
    const updatedListing = await listingCollection.findOne({ _id: listingIdObj });
    const listingPhotos = await listingPhotoCollection.find({ listing_id: listingIdObj }).sort({ photo_order: 1 }).toArray();
    const listingRegions = await listingRegionCollection.find({ listing_id: listingIdObj }).toArray();
    
    // Get related data
    const category = updatedListing.category_id 
      ? await categoryCollection.findOne({ _id: updatedListing.category_id })
      : null;
    const user = updatedListing.user_id
      ? await userCollection.findOne({ _id: updatedListing.user_id })
      : null;

    // Format response
    const formattedListing = {
      id: updatedListing._id.toString(),
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      priceType: updatedListing.price_type,
      location: updatedListing.location,
      city: updatedListing.city,
      venue: updatedListing.venue,
      status: updatedListing.status,
      publishedAt: updatedListing.published_at,
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

    res.json({
      success: true,
      data: formattedListing,
      message: `Listing status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update listing status',
      error: error.message,
    });
  }
};

