/**
 * Category Controller
 * Handles category-related endpoints
 */

const { prisma } = require('../lib/prisma');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    // Get all categories and filter in JavaScript to avoid Prisma validation issues
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        description: true,
        isActive: true,
        // Exclude createdAt and updatedAt to avoid null value errors
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Filter out only explicitly inactive categories (isActive === false)
    const categories = allCategories.filter(cat => cat.isActive !== false);

    res.json({
      success: true,
      data: categories,
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
    const allEventTypes = await prisma.eventType.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        categoryId: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            description: true,
            isActive: true,
          },
        },
        // Exclude createdAt and updatedAt to avoid null value errors
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Filter out only explicitly inactive event types (isActive === false)
    const eventTypes = allEventTypes.filter(et => et.isActive !== false);

    res.json({
      success: true,
      data: eventTypes,
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
    const allServiceTypes = await prisma.serviceType.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        categoryId: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            description: true,
            isActive: true,
          },
        },
        // Exclude createdAt and updatedAt to avoid null value errors
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Filter out only explicitly inactive service types (isActive === false)
    const serviceTypes = allServiceTypes.filter(st => st.isActive !== false);

    res.json({
      success: true,
      data: serviceTypes,
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

