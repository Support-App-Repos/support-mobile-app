/**
 * Seed Controller
 * Manual seeding endpoint for initial data
 * Uses MongoDB directly to bypass Prisma's replica set requirement
 * Access this endpoint once to seed your database
 */

const { getMongoDb, getCollection } = require('../lib/mongodb');

exports.seedDatabase = async (req, res) => {
  try {
    console.log('🌱 Starting database seed via API...');

    // Get MongoDB database instance (reuses existing connection)
    const db = await getMongoDb();

    // Create Categories
    const categories = [
      { name: 'Products', slug: 'products', description: 'Physical products and items for sale' },
      { name: 'Events', slug: 'events', description: 'Events, parties, and gatherings' },
      { name: 'Services', slug: 'services', description: 'Professional and personal services' },
      { name: 'Properties', slug: 'properties', description: 'Real estate and property listings' },
      { name: 'Aesthetics', slug: 'aesthetics', description: 'Beauty and aesthetic treatments' },
    ];

    const createdCategories = {};
    const categoriesCollection = await getCollection('Category');
    
    for (const cat of categories) {
      let category = await categoriesCollection.findOne({ slug: cat.slug });
      if (!category) {
        const result = await categoriesCollection.insertOne({
          ...cat,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        category = await categoriesCollection.findOne({ _id: result.insertedId });
      }
      // Convert MongoDB _id to string for compatibility
      if (category) {
        category.id = category._id.toString();
        createdCategories[cat.slug] = category;
      }
    }

    // Create Event Types
    if (createdCategories.events) {
      const eventTypes = [
        { name: 'Party', slug: 'party', categoryId: createdCategories.events._id },
        { name: 'Meeting', slug: 'meeting', categoryId: createdCategories.events._id },
        { name: 'Workshop', slug: 'workshop', categoryId: createdCategories.events._id },
      ];

      const eventTypesCollection = await getCollection('EventType');
      for (const et of eventTypes) {
        const existing = await eventTypesCollection.findOne({ slug: et.slug });
        if (!existing) {
          await eventTypesCollection.insertOne({
            ...et,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    // Create Service Types (Beauty is a top-level Aesthetics category, not a service subtype)
    if (createdCategories.services) {
      const serviceTypes = [
        { name: 'Professional Service', slug: 'professional-service', categoryId: createdCategories.services._id },
        { name: 'Medical', slug: 'medical', categoryId: createdCategories.services._id },
        { name: 'Home Service', slug: 'home-service', categoryId: createdCategories.services._id },
      ];

      const serviceTypesCollection = await getCollection('ServiceType');
      for (const st of serviceTypes) {
        const existing = await serviceTypesCollection.findOne({ slug: st.slug });
        if (!existing) {
          await serviceTypesCollection.insertOne({
            ...st,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Deactivate legacy Beauty service subtype if present
      await serviceTypesCollection.updateMany(
        { slug: 'beauty' },
        { $set: { is_active: false, updatedAt: new Date() } }
      );
    }

    // Create Regions
    const regions = [
      { name: 'Dubai', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'Abu Dhabi', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'Sharjah', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'Ajman', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'Ras Al Khaimah', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'Fujairah', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'Umm Al Quwain', country: 'United Arab Emirates', country_code: 'AE' },
      { name: 'New York', country: 'United States', country_code: 'US' },
      { name: 'Los Angeles', country: 'United States', country_code: 'US' },
      { name: 'Chicago', country: 'United States', country_code: 'US' },
      { name: 'Houston', country: 'United States', country_code: 'US' },
      { name: 'Phoenix', country: 'United States', country_code: 'US' },
      { name: 'Philadelphia', country: 'United States', country_code: 'US' },
      { name: 'San Antonio', country: 'United States', country_code: 'US' },
      { name: 'San Diego', country: 'United States', country_code: 'US' },
    ];

    const regionsCollection = await getCollection('Region');
    for (const region of regions) {
      const existing = await regionsCollection.findOne({
        name: region.name,
        country: region.country,
      });
      if (!existing) {
        await regionsCollection.insertOne({
          ...region,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Create Payment Plans
    const paymentPlans = [
      {
        name: 'Monthly Subscription',
        type: 'monthly',
        price: 29.99,
        listing_fee: 10.00,
        processing_fee: 1.00,
        features: ['Unlimited listings', 'Priority support', 'Analytics dashboard'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'One-time Payment',
        type: 'onetime',
        price: 49.99,
        listing_fee: 10.00,
        processing_fee: 1.00,
        features: ['Single listing', '30 days visibility', 'Basic support'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const paymentPlansCollection = await getCollection('PaymentPlan');
    for (const plan of paymentPlans) {
      const existing = await paymentPlansCollection.findOne({ type: plan.type });
      if (!existing) {
        await paymentPlansCollection.insertOne(plan);
      } else {
        // Update existing plan to ensure it has correct field names
        await paymentPlansCollection.updateOne(
          { _id: existing._id },
          { 
            $set: {
              listing_fee: plan.listing_fee,
              processing_fee: plan.processing_fee,
              is_active: true,
              updated_at: new Date(),
            }
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    
    // Provide helpful error message for MongoDB replica set requirement
    let errorMessage = error.message;
    if (error.message && error.message.includes('replica set')) {
      errorMessage = 'MongoDB must be running as a replica set. See MONGODB_REPLICA_SET_SETUP.md for setup instructions. ' + error.message;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: errorMessage,
      hint: error.message && error.message.includes('replica set') 
        ? 'Quick fix: Use MongoDB Atlas (free tier) or set up a local replica set. See MONGODB_REPLICA_SET_SETUP.md'
        : undefined,
    });
  }
};
