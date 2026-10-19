require("dotenv").config({ path: "env/.env.production" });
const { MongoClient } = require("mongodb");
(async () => {
  console.log("BUCKET", process.env.AWS_S3_BUCKET);
  console.log("REGION", process.env.AWS_REGION);
  console.log("KEY_PREFIX", (process.env.AWS_ACCESS_KEY_ID || "").slice(0, 8));
  const c = new MongoClient(process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/support-app");
  await c.connect();
  const db = c.db();
  const photos = await db.collection("ListingPhoto").find({}).sort({ _id: -1 }).limit(8).toArray();
  console.log("PHOTO_COUNT_SAMPLE", photos.length);
  for (const p of photos) {
    console.log({
      id: String(p._id),
      url: p.photo_url || p.photoUrl || p.url,
      listing: p.listing_id ? String(p.listing_id) : null,
    });
  }
  const users = await db.collection("User").find({ profile_image_url: { $exists: true, $ne: null } }).limit(5).toArray();
  console.log("USER_IMAGES", users.map(u => ({ email: u.email, url: u.profile_image_url })));
  await c.close();
})().catch((e) => { console.error(e); process.exit(1); });
