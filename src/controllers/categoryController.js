/**
 * Category Controller
 * Handles category-related endpoints
 * Uses raw MongoDB operations to avoid Prisma namespace issues
 */

const { getCollection } = require('../lib/mongodb');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categoryCollection = await getCollection('Category');
    
    // Get all active categories using raw MongoDB
    const categories = await categoryCollection
      .find({ is_active: { $ne: false } })
      .sort({ name: 1 })
      .toArray();
    
    // Transform to match expected format
    const formattedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      iconUrl: cat.icon_url || null,
      description: cat.description || null,
      isActive: cat.is_active !== false,
    }));

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

// Get event types
exports.getEventTypes = async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const eventTypeCollection = await getCollection('EventType');
    const categoryCollection = await getCollection('Category');
    
    // Get ALL event types first (no filter) to see what's in the database
    const allEventTypes = await eventTypeCollection.find({}).sort({ name: 1 }).toArray();
    console.log(`[EventTypes] Total event types in DB: ${allEventTypes.length}`);
    if (allEventTypes.length > 0) {
      console.log(`[EventTypes] Sample event type:`, JSON.stringify(allEventTypes[0], null, 2));
    }
    
    // Filter: is_active is not explicitly false (allows true, null, undefined, missing)
    const eventTypes = allEventTypes.filter(et => {
      // Include if is_active is true, null, undefined, or doesn't exist
      return et.is_active !== false;
    });
    
    console.log(`[EventTypes] Found ${eventTypes.length} event types in database`);
    
    // Get category details for each event type
    const formattedEventTypes = await Promise.all(
      eventTypes.map(async (et) => {
        try {
          // Handle both camelCase (categoryId) and snake_case (category_id) field names
          const categoryIdField = et.category_id || et.categoryId;
          
          // Handle both ObjectId and string category_id, and handle missing category_id
          let categoryId;
          if (!categoryIdField) {
            console.warn(`[EventTypes] Event type ${et.name} (${et._id}) has no category_id or categoryId`);
            return null;
          }
          
          if (categoryIdField instanceof ObjectId) {
            categoryId = categoryIdField;
          } else if (typeof categoryIdField === 'string') {
            try {
              categoryId = new ObjectId(categoryIdField);
            } catch (err) {
              console.warn(`[EventTypes] Invalid ObjectId string for ${et.name}: ${categoryIdField}`);
              return null;
            }
          } else {
            console.warn(`[EventTypes] Invalid category_id type for ${et.name}:`, typeof categoryIdField);
            return null;
          }
          
          const category = await categoryCollection.findOne({ _id: categoryId });
          
          if (!category) {
            console.warn(`[EventTypes] Category not found for event type ${et.name}, category_id: ${categoryId}`);
          }
          
          return {
            id: et._id.toString(),
            name: et.name,
            slug: et.slug,
            iconUrl: et.icon_url || null,
            categoryId: categoryId.toString(),
            isActive: et.is_active !== false,
            category: category ? {
              id: category._id.toString(),
              name: category.name,
              slug: category.slug,
              iconUrl: category.icon_url || null,
              description: category.description || null,
              isActive: category.is_active !== false,
            } : null,
          };
        } catch (err) {
          console.error(`[EventTypes] Error processing event type ${et.name}:`, err);
          return null;
        }
      })
    );

    // Filter out null values (from errors or missing category_id)
    const validEventTypes = formattedEventTypes.filter(et => et !== null);

    console.log(`[EventTypes] Returning ${validEventTypes.length} valid event types`);

    res.json({
      success: true,
      data: validEventTypes,
    });
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event types',
      error: error.message,
    });
  }
};

// Get service types
exports.getServiceTypes = async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const serviceTypeCollection = await getCollection('ServiceType');
    const categoryCollection = await getCollection('Category');
    
    // Get ALL service types first (no filter) to see what's in the database
    const allServiceTypes = await serviceTypeCollection.find({}).sort({ name: 1 }).toArray();
    console.log(`[ServiceTypes] Total service types in DB: ${allServiceTypes.length}`);
    if (allServiceTypes.length > 0) {
      console.log(`[ServiceTypes] Sample service type:`, JSON.stringify(allServiceTypes[0], null, 2));
    }
    
    // Filter: is_active is not explicitly false (allows true, null, undefined, missing)
    const serviceTypes = allServiceTypes.filter(st => {
      // Include if is_active is true, null, undefined, or doesn't exist
      return st.is_active !== false;
    });
    
    console.log(`[ServiceTypes] Found ${serviceTypes.length} service types in database`);
    
    // Get category details for each service type
    const formattedServiceTypes = await Promise.all(
      serviceTypes.map(async (st) => {
        try {
          // Handle both camelCase (categoryId) and snake_case (category_id) field names
          const categoryIdField = st.category_id || st.categoryId;
          
          // Handle both ObjectId and string category_id, and handle missing category_id
          let categoryId;
          if (!categoryIdField) {
            console.warn(`[ServiceTypes] Service type ${st.name} (${st._id}) has no category_id or categoryId`);
            return null;
          }
          
          if (categoryIdField instanceof ObjectId) {
            categoryId = categoryIdField;
          } else if (typeof categoryIdField === 'string') {
            try {
              categoryId = new ObjectId(categoryIdField);
            } catch (err) {
              console.warn(`[ServiceTypes] Invalid ObjectId string for ${st.name}: ${categoryIdField}`);
              return null;
            }
          } else {
            console.warn(`[ServiceTypes] Invalid category_id type for ${st.name}:`, typeof categoryIdField);
            return null;
          }
          
          const category = await categoryCollection.findOne({ _id: categoryId });
          
          if (!category) {
            console.warn(`[ServiceTypes] Category not found for service type ${st.name}, category_id: ${categoryId}`);
          }
          
          return {
            id: st._id.toString(),
            name: st.name,
            slug: st.slug,
            iconUrl: st.icon_url || null,
            categoryId: categoryId.toString(),
            isActive: st.is_active !== false,
            category: category ? {
              id: category._id.toString(),
              name: category.name,
              slug: category.slug,
              iconUrl: category.icon_url || null,
              description: category.description || null,
              isActive: category.is_active !== false,
            } : null,
          };
        } catch (err) {
          console.error(`[ServiceTypes] Error processing service type ${st.name}:`, err);
          return null;
        }
      })
    );

    // Filter out null values (from errors or missing category_id)
    const validServiceTypes = formattedServiceTypes.filter(st => st !== null);

    console.log(`[ServiceTypes] Returning ${validServiceTypes.length} valid service types`);

    res.json({
      success: true,
      data: validServiceTypes,
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service types',
      error: error.message,
    });
  }
};

