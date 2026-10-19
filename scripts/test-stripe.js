require('dotenv').config({ path: 'env/.env.production' });
const { MongoClient } = require('mongodb');

async function main() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  console.log('stripe_key_prefix', key.slice(0, 12), 'len', key.length);

  const stripe = require('stripe')(key);
  try {
    const pi = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    console.log('PI_OK', pi.id, pi.status);
  } catch (e) {
    console.error('PI_FAIL', e.message);
  }

  const c = new MongoClient(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/support-app');
  await c.connect();
  const db = c.db();
  const count = await db.collection('PaymentPlan').countDocuments();
  console.log('PaymentPlan_count', count);
  const plans = await db.collection('PaymentPlan').find({}).limit(5).toArray();
  console.log(
    'plans',
    plans.map((p) => ({
      id: String(p._id),
      name: p.name,
      type: p.type,
      price: p.price,
      listing_fee: p.listing_fee,
      listingFee: p.listingFee,
    }))
  );
  await c.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
