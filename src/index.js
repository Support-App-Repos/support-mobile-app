const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
require('dotenv').config({ path: `env/.env.${NODE_ENV}` });
console.log('Running mode:', NODE_ENV);
const mongoose = require('mongoose');
const { init } = require('./server');

async function startServer() {
  try {
    // Check if DB_CONNECTION is set
    if (!process.env.DB_CONNECTION) {
      console.error('ERROR: DB_CONNECTION is not set in .env file');
      process.exit(1);
    }

    console.log('Connecting to MongoDB:', process.env.DB_CONNECTION);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECTION);
    
    console.log('✓ Database Connection Succeeded');
    
    mongoose.Promise = global.Promise;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('✗ Database Connection Error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Database disconnected');
    });
    
    // Start the server after successful connection
    await init();
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    console.error('Error details:', err);
    process.exit(1);
  }
}

startServer();
