/**
 * End-to-end: login + create-payment-intent against local API
 */
require('dotenv').config({ path: 'env/.env.production' });
const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers.Authorization = `Bearer ${token}`;
    const req = http.request(
      { hostname: '127.0.0.1', port: 3000, path, method, headers },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = { raw };
          }
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const login = await request('POST', '/api/auth/login', {
    email: 'admin@youzell.com',
    password: 'Admin@123',
  });
  console.log('LOGIN', login.status, login.json.success);
  const token = login.json.token;
  if (!token) {
    console.error('No token');
    process.exit(1);
  }

  const client = new MongoClient(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/support-app');
  await client.connect();
  const db = client.db();
  const plan = await db.collection('PaymentPlan').findOne({});
  const listing = await db.collection('Listing').findOne({}) || await db.collection('Listing').findOne({ status: 'Active' });
  console.log('PLAN', plan && String(plan._id), plan && plan.name);
  console.log('LISTING', listing && String(listing._id), listing && listing.title, listing && listing.status);

  if (!plan) {
    console.error('No payment plan');
    process.exit(1);
  }

  // If no listing, create a minimal one owned by admin for test
  let listingId = listing ? String(listing._id) : null;
  if (!listingId) {
    const user = await db.collection('User').findOne({ email: 'admin@youzell.com' });
    const cat = await db.collection('Category').findOne({});
    const inserted = await db.collection('Listing').insertOne({
      title: 'Stripe Test Listing',
      status: 'Draft',
      price: 10,
      currency: 'USD',
      user_id: user._id,
      category_id: cat ? cat._id : null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    listingId = String(inserted.insertedId);
    console.log('CREATED_LISTING', listingId);
  }

  const pi = await request(
    'POST',
    '/api/stripe/create-payment-intent',
    {
      listingId,
      paymentPlanId: String(plan._id),
    },
    token
  );
  console.log('CREATE_PI', pi.status, JSON.stringify(pi.json).slice(0, 800));

  const bookingPi = await request(
    'POST',
    '/api/stripe/create-booking-payment-intent',
    {
      type: 'service',
      listingId,
      addonIds: [],
    },
    token
  );
  console.log('BOOKING_PI', bookingPi.status, JSON.stringify(bookingPi.json).slice(0, 800));

  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
