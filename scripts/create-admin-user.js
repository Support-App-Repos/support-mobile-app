/**
 * Script to create an admin user
 * Run with: node scripts/create-admin-user.js
 */

// Load environment variables
const path = require('path');
const fs = require('fs');

// Try to load .env.development first, then .env.production, then .env
const envPaths = [
  path.join(__dirname, '../env/.env.development'),
  path.join(__dirname, '../env/.env.production'),
  path.join(__dirname, '../.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`📄 Loaded environment from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found. Using default values or environment variables.');
}
const { getCollection } = require('../src/lib/mongodb');
const { getHashPasswordAndSalt } = require('../src/helpers/auth/user');

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL is not set in environment variables.');
      console.error('   Please set DATABASE_URL in your .env file or environment variables.');
      console.error('   Example: DATABASE_URL=mongodb://localhost:27017/youzell');
      process.exit(1);
    }

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@youzell.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    console.log('📧 Admin Email:', adminEmail);
    console.log('👤 Admin Name:', adminName);
    console.log('');

    const userCollection = await getCollection('User');

    // Check if admin user already exists
    const existingAdmin = await userCollection.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('   To update password, delete the user first or update manually.');
      return;
    }

    // Hash password
    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(adminPassword);

    // Create admin user
    const adminData = {
      email: adminEmail.toLowerCase(),
      phone_number: null,
      password_hash: `${hashedPassword}:${salt}`,
      full_name: adminName,
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await userCollection.insertOne(adminData);
    const createdAdmin = await userCollection.findOne({ _id: result.insertedId });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', adminName);
    console.log('🆔 User ID:', createdAdmin._id.toString());
    console.log('');
    console.log('⚠️  Please change the default password after first login!');
    console.log('⚠️  Store these credentials securely!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();

