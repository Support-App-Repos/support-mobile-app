/**
 * MongoDB Connection Utility
 * Reuses the MongoDB connection established in index.js
 * Provides easy access to database and collections
 * Similar to prisma.js, but for direct MongoDB access (bypasses Prisma's replica set requirement)
 */

const mongoose = require('mongoose');

/**
 * Get MongoDB database instance
 * Uses the existing mongoose connection from index.js
 * Only connects if not already connected (for scripts/standalone usage)
 * @returns {Promise<Db>} MongoDB database instance
 */
async function getMongoDb() {
  // If already connected (normal case), use existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  // If connecting or disconnected, wait for connection
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
    return mongoose.connection.db;
  }

  // If disconnected (for scripts/standalone usage), connect
  if (mongoose.connection.readyState === 0) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    await mongoose.connect(databaseUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    return mongoose.connection.db;
  }

  // Fallback: return existing db if available
  return mongoose.connection.db;
}

/**
 * Get a specific collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Collection>} MongoDB collection instance
 */
async function getCollection(collectionName) {
  const db = await getMongoDb();
  return db.collection(collectionName);
}

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Close MongoDB connection (useful for testing or graceful shutdown)
 */
async function closeConnection() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    mongoConnection = null;
    if (process.env.NODE_ENV !== 'production') {
      globalForMongo.mongoConnection = null;
    }
  }
}

module.exports = {
  getMongoDb,
  getCollection,
  isConnected,
  closeConnection,
  mongoose, // Export mongoose for advanced usage if needed
};

