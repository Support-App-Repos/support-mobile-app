/**
 * Create/reset admin portal users on MongoDB.
 * Usage: node scripts/reset-admin-users.js
 */
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const password = crypto
    .pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${password}:${salt}`;
}

async function main() {
  const uri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/support-app';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const users = [
    { email: 'admin@youzell.com', full_name: 'Admin User' },
    { email: 'roshaan.rao@youzell.com', full_name: 'Roshaan Rao' },
  ];

  const client = new MongoClient(uri);
  await client.connect();
  const dbName = uri.split('/').pop().split('?')[0] || 'support-app';
  const col = client.db(dbName).collection('User');

  for (const u of users) {
    const email = u.email.toLowerCase();
    const password_hash = hashPassword(password);
    const existing = await col.findOne({ email });
    if (existing) {
      await col.updateOne(
        { email },
        {
          $set: {
            password_hash,
            full_name: u.full_name,
            is_verified: true,
            is_active: true,
            updated_at: new Date(),
          },
        }
      );
      console.log('UPDATED', email);
    } else {
      await col.insertOne({
        email,
        phone_number: null,
        password_hash,
        full_name: u.full_name,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('CREATED', email);
    }
  }

  console.log('');
  console.log('Password for both accounts:', password);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
