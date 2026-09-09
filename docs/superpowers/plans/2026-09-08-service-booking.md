# Service Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let buyers book an Active store service listing end-to-end (Choose Service → Date/Time → Add-ons → Confirm → Confirmed) with real add-ons and persisted `ServiceBooking` records, and let sellers manage add-ons on service create/edit.

**Architecture:** Backend adds Mongo collections `ServiceAddon` and `ServiceBooking` (Prisma schema + raw Mongo controllers matching existing Listing/Store style). Mobile adds a booking stack of four screens, a `bookingService`, and seller add-on UI on `ServiceListingScreen`. No Stripe; Book Now opens the flow only when `listing.store.id` exists.

**Tech Stack:** Node/Express + MongoDB (`getCollection`) + Prisma schema; React Native + axios `ApiService`; Jest for mobile pure helpers; Node built-in `node --test` for backend helpers.

**Spec:** `docs/superpowers/specs/2026-09-08-service-booking-design.md`

## Global Constraints

- Catalog = Active listings for the store whose category slug includes `service` (seeded slug `services`)
- Current listing first / pre-highlighted via `highlightListingId`
- No Stripe / wallet payment for bookings in v1
- Event Book Now unchanged
- No full availability engine — disable past dates; optional conflict styling only if conflicting bookings exist
- Collection field naming: snake_case in Mongo, camelCase in API JSON (match `storeController` / `listingController`)
- API responses: `{ success, data, message? }`
- Auth: `jwtAuth` + `addReqUser` + `getUserId(req)` for writes; ownership = listing `user_id`
- Repos: backend `D:\Extra Work\support-backend`, mobile `D:\Extra Work\support-mobile-app` — commit in the repo you change

---

## File structure

### Backend (`support-backend`)

| File | Responsibility |
|------|----------------|
| `prisma/schema.prisma` | `ServiceAddon`, `ServiceBooking` models |
| `src/helpers/bookingHelper.js` | Pure total/snapshot helpers |
| `src/helpers/bookingHelper.test.js` | Node test runner for helpers |
| `src/controllers/serviceAddonController.js` | Add-on CRUD |
| `src/controllers/serviceBookingController.js` | Create/get booking + store service catalog |
| `src/routes.js` | Wire public + protected routes |

### Mobile (`support-mobile-app`)

| File | Responsibility |
|------|----------------|
| `src/utils/bookingTotals.ts` | Pure total math |
| `__tests__/bookingTotals.test.ts` | Jest for totals |
| `src/services/bookingService.ts` | Catalog, add-ons, bookings API |
| `src/services/index.ts` | Export bookingService |
| `src/types/index.ts` | Nav params + booking types |
| `src/navigation/AppNavigator.tsx` | Register 4 screens |
| `src/screens/booking/ChooseServiceScreen.tsx` | Store service catalog |
| `src/screens/booking/SelectBookingDateTimeScreen.tsx` | Calendar + slots |
| `src/screens/booking/ServiceBookingAddOnsScreen.tsx` | Multi-select add-ons + confirm |
| `src/screens/booking/BookingConfirmedScreen.tsx` | Success summary |
| `src/screens/ServiceListingDetailScreen.tsx` | Wire Book Now |
| `src/screens/ServiceListingScreen.tsx` | Seller Optional add-ons section |

---

### Task 1: Backend booking helpers + Prisma models

**Files:**
- Create: `D:\Extra Work\support-backend\src\helpers\bookingHelper.js`
- Create: `D:\Extra Work\support-backend\src\helpers\bookingHelper.test.js`
- Modify: `D:\Extra Work\support-backend\prisma\schema.prisma` (append after `StoreDocument`)
- Modify: `D:\Extra Work\support-backend\package.json` (add `"test:helpers": "node --test src/helpers/**/*.test.js"`)

**Interfaces:**
- Produces: `computeBookingTotals(servicePrice, addons)`, `formatAddonSnapshot(addon)`, `isServiceCategorySlug(slug)`

- [ ] **Step 1: Write the failing helper test**

```js
// src/helpers/bookingHelper.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
} = require('./bookingHelper');

describe('computeBookingTotals', () => {
  it('sums service price and addon prices', () => {
    const result = computeBookingTotals(100, [
      { price: 10 },
      { price: 5.5 },
    ]);
    assert.deepEqual(result, { addonsTotal: 15.5, totalAmount: 115.5 });
  });

  it('treats missing service price as 0', () => {
    const result = computeBookingTotals(null, [{ price: 20 }]);
    assert.deepEqual(result, { addonsTotal: 20, totalAmount: 20 });
  });
});

describe('formatAddonSnapshot', () => {
  it('maps mongo addon doc to snapshot', () => {
    assert.deepEqual(
      formatAddonSnapshot({
        _id: { toString: () => 'abc' },
        name: 'Extra',
        price: 12,
      }),
      { id: 'abc', name: 'Extra', price: 12 },
    );
  });
});

describe('isServiceCategorySlug', () => {
  it('matches services slug', () => {
    assert.equal(isServiceCategorySlug('services'), true);
    assert.equal(isServiceCategorySlug('products'), false);
    assert.equal(isServiceCategorySlug(null), false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `support-backend`):

```bash
node --test src/helpers/bookingHelper.test.js
```

Expected: FAIL — `Cannot find module './bookingHelper'`

- [ ] **Step 3: Implement helpers**

```js
// src/helpers/bookingHelper.js
function computeBookingTotals(servicePrice, addons = []) {
  const base = typeof servicePrice === 'number' && !Number.isNaN(servicePrice) ? servicePrice : 0;
  const addonsTotal = (addons || []).reduce((sum, a) => {
    const p = typeof a?.price === 'number' && !Number.isNaN(a.price) ? a.price : 0;
    return sum + p;
  }, 0);
  return { addonsTotal, totalAmount: base + addonsTotal };
}

function formatAddonSnapshot(addon) {
  return {
    id: addon._id.toString(),
    name: addon.name,
    price: addon.price,
  };
}

function isServiceCategorySlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return slug.toLowerCase().includes('service');
}

module.exports = {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
};
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --test src/helpers/bookingHelper.test.js
```

Expected: 4 tests pass

- [ ] **Step 5: Append Prisma models**

Append to `prisma/schema.prisma` after `StoreDocument`:

```prisma
model ServiceAddon {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  listingId   String   @map("listing_id") @db.ObjectId
  storeId     String?  @map("store_id") @db.ObjectId
  userId      String   @map("user_id") @db.ObjectId
  name        String
  description String?
  price       Float
  icon        String?
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([listingId])
  @@index([storeId])
  @@index([userId])
  @@map("ServiceAddon")
}

model ServiceBooking {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  storeId          String   @map("store_id") @db.ObjectId
  listingId        String   @map("listing_id") @db.ObjectId
  buyerUserId      String   @map("buyer_user_id") @db.ObjectId
  sellerUserId     String   @map("seller_user_id") @db.ObjectId
  serviceTitle     String   @map("service_title")
  servicePrice     Float    @map("service_price")
  currency         String?
  priceType        String?  @map("price_type")
  duration         String?
  appointmentDate  String   @map("appointment_date")
  appointmentTime  String   @map("appointment_time")
  addonIds         String[] @map("addon_ids") @db.ObjectId
  addonsSnapshot   Json     @map("addons_snapshot")
  addonsTotal      Float    @map("addons_total")
  totalAmount      Float    @map("total_amount")
  status           String   @default("Confirmed")
  notes            String?
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@index([buyerUserId])
  @@index([sellerUserId])
  @@index([storeId])
  @@index([listingId])
  @@index([appointmentDate])
  @@map("ServiceBooking")
}
```

Run: `npx prisma generate` (schema docs only; runtime uses raw Mongo — generate must succeed).

- [ ] **Step 6: Add npm script and commit (backend)**

In `package.json` scripts: `"test:helpers": "node --test src/helpers/**/*.test.js"`

```bash
git add src/helpers/bookingHelper.js src/helpers/bookingHelper.test.js prisma/schema.prisma package.json
git commit -m "Add ServiceAddon and ServiceBooking models plus booking total helpers."
```

---

### Task 2: Store service catalog API

**Files:**
- Create: `D:\Extra Work\support-backend\src\controllers\serviceBookingController.js`
- Modify: `D:\Extra Work\support-backend\src\routes.js`

**Interfaces:**
- Consumes: `getCollection`, `isServiceCategorySlug`, store `formatStore`-style fields
- Produces: `GET /stores/:storeId/service-listings?highlightListingId=` → `{ success, data: { store, listings } }`

- [ ] **Step 1: Implement `getStoreServiceListings`**

Create `serviceBookingController.js` with shared `toObjectId` (copy pattern from `storeController.js`) and:

```js
const { getCollection } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');
const { isServiceCategorySlug } = require('../helpers/bookingHelper');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatCatalogListing = (listing, photos, category) => ({
  id: listing._id.toString(),
  title: listing.title,
  description: listing.description,
  price: listing.price ?? null,
  priceType: listing.price_type ?? null,
  currency: listing.currency ?? null,
  duration: listing.duration ?? null,
  specialization: listing.specialization ?? null,
  ratingAverage: listing.rating_average || 0,
  photos: (photos || []).map((p) => ({
    id: p._id.toString(),
    photoUrl: p.photo_url,
    isPrimary: p.is_primary,
  })),
  category: category
    ? { id: category._id.toString(), name: category.name, slug: category.slug }
    : null,
});

exports.getStoreServiceListings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const highlightListingId = req.query.highlightListingId || null;

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const listingPhotoCollection = await getCollection('ListingPhoto');
    const categoryCollection = await getCollection('Category');

    let store = null;
    const storeObj = toObjectId(storeId);
    if (storeObj) store = await storeCollection.findOne({ _id: storeObj });
    if (!store) store = await storeCollection.findOne({ slug: storeId });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const categories = await categoryCollection.find({}).toArray();
    const serviceCategoryIds = categories
      .filter((c) => isServiceCategorySlug(c.slug || c.name))
      .map((c) => c._id);

    const query = {
      store_id: store._id,
      status: 'Active',
      category_id: { $in: serviceCategoryIds },
    };

    let listings = await listingCollection.find(query).sort({ created_at: -1 }).toArray();

    const highlightObj = toObjectId(highlightListingId);
    if (highlightObj) {
      const idx = listings.findIndex((l) => l._id.equals(highlightObj));
      if (idx > 0) {
        const [highlighted] = listings.splice(idx, 1);
        listings.unshift(highlighted);
      }
    }

    const data = await Promise.all(
      listings.map(async (listing) => {
        const photos = await listingPhotoCollection
          .find({ listing_id: listing._id })
          .sort({ is_primary: -1, photo_order: 1 })
          .toArray();
        const category = listing.category_id
          ? categories.find((c) => c._id.equals(listing.category_id))
          : null;
        return formatCatalogListing(listing, photos, category);
      }),
    );

    res.json({
      success: true,
      data: {
        store: {
          id: store._id.toString(),
          name: store.name,
          logoUrl: store.logo_url || null,
          isVerified: store.is_verified === true,
          ratingAverage: store.rating_average || 0,
          businessCategory: store.business_category,
        },
        listings: data,
        highlightListingId: highlightListingId || null,
      },
    });
  } catch (error) {
    console.error('Error fetching store service listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store service listings',
      error: error.message,
    });
  }
};

// placeholders filled in later tasks
exports.createBooking = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
exports.getBookingById = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
```

- [ ] **Step 2: Register public route**

In `routes.js`, require controller and add **before** `/stores/:id` is fine; place with other public store routes:

```js
const serviceBookingController = require('./controllers/serviceBookingController');
// ...
router.get(
  '/stores/:storeId/service-listings',
  serviceBookingController.getStoreServiceListings,
);
```

Place this **above** or alongside `router.get('/stores/:id/listings', ...)` — param name `storeId` vs `id` is fine (Express treats them as different path strings).

- [ ] **Step 3: Manual verify**

With server running and a known Active service listing:

```powershell
Invoke-RestMethod "http://localhost:PORT/api/stores/STORE_ID/service-listings?highlightListingId=LISTING_ID"
```

Expected: `success: true`, `data.listings[0].id` equals highlight when that listing is Active for the store.

- [ ] **Step 4: Commit (backend)**

```bash
git add src/controllers/serviceBookingController.js src/routes.js
git commit -m "Add store Active service listings catalog endpoint for booking."
```

---

### Task 3: Service add-ons CRUD API

**Files:**
- Create: `D:\Extra Work\support-backend\src\controllers\serviceAddonController.js`
- Modify: `D:\Extra Work\support-backend\src\routes.js`

**Interfaces:**
- Produces:
  - `GET /listings/:listingId/addons` (public Active; `?all=1` owner)
  - `POST /listings/:listingId/addons` owner
  - `PUT /listings/:listingId/addons/:addonId` owner
  - `DELETE /listings/:listingId/addons/:addonId` owner
- Shape: `{ id, listingId, storeId, name, description, price, icon, isActive, sortOrder }`

- [ ] **Step 1: Implement controller**

```js
const { getCollection } = require('../lib/mongodb');
const { getUserId } = require('../helpers/userHelper');
const { ObjectId } = require('mongodb');

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return id instanceof ObjectId ? id : new ObjectId(id);
  } catch {
    return null;
  }
};

const formatAddon = (doc) => ({
  id: doc._id.toString(),
  listingId: doc.listing_id?.toString(),
  storeId: doc.store_id?.toString() || null,
  userId: doc.user_id?.toString(),
  name: doc.name,
  description: doc.description || null,
  price: doc.price,
  icon: doc.icon || null,
  isActive: doc.is_active !== false,
  sortOrder: doc.sort_order || 0,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
});

async function loadOwnedListing(listingId, userId) {
  const listingCollection = await getCollection('Listing');
  const listingObj = toObjectId(listingId);
  if (!listingObj) return { error: { status: 400, message: 'Invalid listing id' } };
  const listing = await listingCollection.findOne({ _id: listingObj });
  if (!listing) return { error: { status: 404, message: 'Listing not found' } };
  if (listing.user_id?.toString() !== userId) {
    return { error: { status: 403, message: 'Forbidden' } };
  }
  return { listing };
}

exports.getAddons = async (req, res) => {
  try {
    const listingObj = toObjectId(req.params.listingId);
    if (!listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid listing id' });
    }

    const listingCollection = await getCollection('Listing');
    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const wantAll = req.query.all === '1' || req.query.all === 'true';
    const userId = getUserId(req);
    const isOwner = userId && listing.user_id?.toString() === userId;

    const addonCollection = await getCollection('ServiceAddon');
    const query = { listing_id: listingObj };
    if (!(wantAll && isOwner)) {
      query.is_active = true;
    }

    const addons = await addonCollection
      .find(query)
      .sort({ sort_order: 1, created_at: 1 })
      .toArray();

    res.json({ success: true, data: addons.map(formatAddon) });
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addons', error: error.message });
  }
};

exports.createAddon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const owned = await loadOwnedListing(req.params.listingId, userId);
    if (owned.error) {
      return res.status(owned.error.status).json({ success: false, message: owned.error.message });
    }

    const { name, description, price, icon, isActive, sortOrder } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a number >= 0' });
    }

    const now = new Date();
    const doc = {
      listing_id: owned.listing._id,
      store_id: owned.listing.store_id || null,
      user_id: toObjectId(userId),
      name: name.trim(),
      description: description?.trim() || null,
      price,
      icon: icon?.trim() || null,
      is_active: isActive !== false,
      sort_order: typeof sortOrder === 'number' ? sortOrder : 0,
      created_at: now,
      updated_at: now,
    };

    const addonCollection = await getCollection('ServiceAddon');
    const result = await addonCollection.insertOne(doc);
    const created = await addonCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, data: formatAddon(created) });
  } catch (error) {
    console.error('Error creating addon:', error);
    res.status(500).json({ success: false, message: 'Failed to create addon', error: error.message });
  }
};

exports.updateAddon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const owned = await loadOwnedListing(req.params.listingId, userId);
    if (owned.error) {
      return res.status(owned.error.status).json({ success: false, message: owned.error.message });
    }

    const addonObj = toObjectId(req.params.addonId);
    if (!addonObj) {
      return res.status(400).json({ success: false, message: 'Invalid addon id' });
    }

    const addonCollection = await getCollection('ServiceAddon');
    const existing = await addonCollection.findOne({
      _id: addonObj,
      listing_id: owned.listing._id,
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Add-on not found' });
    }

    const { name, description, price, icon, isActive, sortOrder } = req.body;
    const update = { updated_at: new Date() };
    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }
      update.name = name.trim();
    }
    if (description !== undefined) update.description = description?.trim() || null;
    if (price !== undefined) {
      if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a number >= 0' });
      }
      update.price = price;
    }
    if (icon !== undefined) update.icon = icon?.trim() || null;
    if (isActive !== undefined) update.is_active = !!isActive;
    if (sortOrder !== undefined) update.sort_order = sortOrder;

    await addonCollection.updateOne({ _id: addonObj }, { $set: update });
    const updated = await addonCollection.findOne({ _id: addonObj });
    res.json({ success: true, data: formatAddon(updated) });
  } catch (error) {
    console.error('Error updating addon:', error);
    res.status(500).json({ success: false, message: 'Failed to update addon', error: error.message });
  }
};

exports.deleteAddon = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const owned = await loadOwnedListing(req.params.listingId, userId);
    if (owned.error) {
      return res.status(owned.error.status).json({ success: false, message: owned.error.message });
    }

    const addonObj = toObjectId(req.params.addonId);
    if (!addonObj) {
      return res.status(400).json({ success: false, message: 'Invalid addon id' });
    }

    const addonCollection = await getCollection('ServiceAddon');
    const result = await addonCollection.deleteOne({
      _id: addonObj,
      listing_id: owned.listing._id,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Add-on not found' });
    }
    res.json({ success: true, message: 'Add-on deleted' });
  } catch (error) {
    console.error('Error deleting addon:', error);
    res.status(500).json({ success: false, message: 'Failed to delete addon', error: error.message });
  }
};
```

- [ ] **Step 2: Wire routes**

Public (near listing GETs — `getAddons` uses optional JWT via `getUserId` without requiring auth):

```js
const serviceAddonController = require('./controllers/serviceAddonController');

router.get('/listings/:listingId/addons', serviceAddonController.getAddons);
```

Protected (after `router.use(jwtAuth)`):

```js
router.post('/listings/:listingId/addons', serviceAddonController.createAddon);
router.put('/listings/:listingId/addons/:addonId', serviceAddonController.updateAddon);
router.delete('/listings/:listingId/addons/:addonId', serviceAddonController.deleteAddon);
```

Note: Express matches `/listings/:id` before `/listings/:listingId/addons` only if registered first as exact path — register **addon routes before** `GET /listings/:id` OR use distinct path. Safest: register `GET /listings/:listingId/addons` **before** `GET /listings/:id` so `:id` never captures `"xyz/addons"`. Actually `:id` won't match slashes — `listings/abc/addons` is a different route. Order is fine either way.

- [ ] **Step 3: Manual verify create + list**

```powershell
# with Bearer token of listing owner
$body = @{ name = "Hair wash"; price = 15; description = "Extra wash" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:PORT/api/listings/LISTING_ID/addons" -Headers @{ Authorization = "Bearer TOKEN" } -ContentType "application/json" -Body $body
Invoke-RestMethod "http://localhost:PORT/api/listings/LISTING_ID/addons"
```

Expected: 201 create; public GET returns active addon.

- [ ] **Step 4: Commit (backend)**

```bash
git add src/controllers/serviceAddonController.js src/routes.js
git commit -m "Add service listing add-ons CRUD API for booking extras."
```

---

### Task 4: Create + get booking API

**Files:**
- Modify: `D:\Extra Work\support-backend\src\controllers\serviceBookingController.js`
- Modify: `D:\Extra Work\support-backend\src\routes.js`

**Interfaces:**
- Consumes: `computeBookingTotals`, `formatAddonSnapshot`
- Produces:
  - `POST /bookings` body `{ storeId, listingId, appointmentDate, appointmentTime, addonIds? }`
  - `GET /bookings/:id` buyer or seller only
- Status on create: `Confirmed`

- [ ] **Step 1: Replace placeholders with real handlers**

Add requires at top of `serviceBookingController.js`:

```js
const { getUserId } = require('../helpers/userHelper');
const {
  computeBookingTotals,
  formatAddonSnapshot,
  isServiceCategorySlug,
} = require('../helpers/bookingHelper');
```

Implement:

```js
const formatBooking = (doc) => ({
  id: doc._id.toString(),
  storeId: doc.store_id.toString(),
  listingId: doc.listing_id.toString(),
  buyerUserId: doc.buyer_user_id.toString(),
  sellerUserId: doc.seller_user_id.toString(),
  serviceTitle: doc.service_title,
  servicePrice: doc.service_price,
  currency: doc.currency || null,
  priceType: doc.price_type || null,
  duration: doc.duration || null,
  appointmentDate: doc.appointment_date,
  appointmentTime: doc.appointment_time,
  addonIds: (doc.addon_ids || []).map((id) => id.toString()),
  addonsSnapshot: doc.addons_snapshot || [],
  addonsTotal: doc.addons_total,
  totalAmount: doc.total_amount,
  status: doc.status,
  notes: doc.notes || null,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
});

exports.createBooking = async (req, res) => {
  try {
    const buyerUserId = getUserId(req);
    if (!buyerUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { storeId, listingId, appointmentDate, appointmentTime, addonIds = [] } = req.body;
    if (!storeId || !listingId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'storeId, listingId, appointmentDate, and appointmentTime are required',
      });
    }

    const storeObj = toObjectId(storeId);
    const listingObj = toObjectId(listingId);
    if (!storeObj || !listingObj) {
      return res.status(400).json({ success: false, message: 'Invalid storeId or listingId' });
    }

    const storeCollection = await getCollection('Store');
    const listingCollection = await getCollection('Listing');
    const categoryCollection = await getCollection('Category');
    const addonCollection = await getCollection('ServiceAddon');
    const bookingCollection = await getCollection('ServiceBooking');

    const store = await storeCollection.findOne({ _id: storeObj });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const listing = await listingCollection.findOne({ _id: listingObj });
    if (!listing || listing.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Listing is not available for booking' });
    }
    if (!listing.store_id || !listing.store_id.equals(storeObj)) {
      return res.status(400).json({ success: false, message: 'Listing does not belong to this store' });
    }

    const category = listing.category_id
      ? await categoryCollection.findOne({ _id: listing.category_id })
      : null;
    if (!isServiceCategorySlug(category?.slug || category?.name)) {
      return res.status(400).json({ success: false, message: 'Only service listings can be booked' });
    }

    let selectedAddons = [];
    if (Array.isArray(addonIds) && addonIds.length > 0) {
      const addonObjectIds = addonIds.map(toObjectId).filter(Boolean);
      selectedAddons = await addonCollection
        .find({
          _id: { $in: addonObjectIds },
          listing_id: listingObj,
          is_active: true,
        })
        .toArray();
      if (selectedAddons.length !== addonObjectIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more add-ons are invalid or inactive',
        });
      }
    }

    const snapshots = selectedAddons.map(formatAddonSnapshot);
    const { addonsTotal, totalAmount } = computeBookingTotals(listing.price, selectedAddons);
    const now = new Date();

    const doc = {
      store_id: storeObj,
      listing_id: listingObj,
      buyer_user_id: toObjectId(buyerUserId),
      seller_user_id: listing.user_id,
      service_title: listing.title,
      service_price: typeof listing.price === 'number' ? listing.price : 0,
      currency: listing.currency || null,
      price_type: listing.price_type || null,
      duration: listing.duration || null,
      appointment_date: String(appointmentDate),
      appointment_time: String(appointmentTime),
      addon_ids: selectedAddons.map((a) => a._id),
      addons_snapshot: snapshots,
      addons_total: addonsTotal,
      total_amount: totalAmount,
      status: 'Confirmed',
      notes: null,
      created_at: now,
      updated_at: now,
    };

    const result = await bookingCollection.insertOne(doc);
    const created = await bookingCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, data: formatBooking(created) });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bookingObj = toObjectId(req.params.id);
    if (!bookingObj) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const bookingCollection = await getCollection('ServiceBooking');
    const booking = await bookingCollection.findOne({ _id: bookingObj });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isBuyer = booking.buyer_user_id?.toString() === userId;
    const isSeller = booking.seller_user_id?.toString() === userId;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: formatBooking(booking) });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking', error: error.message });
  }
};
```

- [ ] **Step 2: Register protected routes**

After `jwtAuth` middleware block:

```js
router.post('/bookings', serviceBookingController.createBooking);
router.get('/bookings/:id', serviceBookingController.getBookingById);
```

- [ ] **Step 3: Manual verify**

POST booking with buyer token; GET same id as buyer — expect 201 + matching totals.

- [ ] **Step 4: Commit (backend)**

```bash
git add src/controllers/serviceBookingController.js src/routes.js
git commit -m "Add service booking create and get-by-id endpoints."
```

---

### Task 5: Mobile booking totals + API client + types

**Files:**
- Create: `D:\Extra Work\support-mobile-app\src\utils\bookingTotals.ts`
- Create: `D:\Extra Work\support-mobile-app\__tests__\bookingTotals.test.ts`
- Create: `D:\Extra Work\support-mobile-app\src\services\bookingService.ts`
- Modify: `D:\Extra Work\support-mobile-app\src\services\index.ts`
- Modify: `D:\Extra Work\support-mobile-app\src\types\index.ts`

**Interfaces:**
- Produces: `computeBookingTotals(servicePrice, addons)`, `bookingService.*`, nav param types

- [ ] **Step 1: Write failing Jest test**

```ts
// __tests__/bookingTotals.test.ts
import { computeBookingTotals } from '../src/utils/bookingTotals';

describe('computeBookingTotals', () => {
  it('adds service and addon prices', () => {
    expect(
      computeBookingTotals(50, [
        { price: 10 },
        { price: 5 },
      ]),
    ).toEqual({ addonsTotal: 15, totalAmount: 65 });
  });

  it('handles empty addons', () => {
    expect(computeBookingTotals(40, [])).toEqual({
      addonsTotal: 0,
      totalAmount: 40,
    });
  });
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npx jest __tests__/bookingTotals.test.ts
```

Expected: FAIL cannot find module

- [ ] **Step 3: Implement util + service + types**

```ts
// src/utils/bookingTotals.ts
export function computeBookingTotals(
  servicePrice: number | null | undefined,
  addons: Array<{ price: number }>,
): { addonsTotal: number; totalAmount: number } {
  const base = typeof servicePrice === 'number' && !Number.isNaN(servicePrice) ? servicePrice : 0;
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  return { addonsTotal, totalAmount: base + addonsTotal };
}
```

```ts
// src/services/bookingService.ts
import { ApiService } from './api';

export type ServiceAddon = {
  id: string;
  listingId: string;
  storeId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  icon?: string | null;
  isActive: boolean;
  sortOrder?: number;
};

export type ServiceBooking = {
  id: string;
  storeId: string;
  listingId: string;
  serviceTitle: string;
  servicePrice: number;
  currency?: string | null;
  priceType?: string | null;
  duration?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  addonIds: string[];
  addonsSnapshot: Array<{ id: string; name: string; price: number }>;
  addonsTotal: number;
  totalAmount: number;
  status: string;
};

class BookingService {
  private apiService = new ApiService();

  async getStoreServiceListings(storeId: string, highlightListingId?: string) {
    const qs = highlightListingId
      ? `?highlightListingId=${encodeURIComponent(highlightListingId)}`
      : '';
    return this.apiService.get<{
      success: boolean;
      data: {
        store: any;
        listings: any[];
        highlightListingId: string | null;
      };
    }>(`/stores/${storeId}/service-listings${qs}`);
  }

  async getAddons(listingId: string, all = false) {
    const qs = all ? '?all=1' : '';
    return this.apiService.get<{ success: boolean; data: ServiceAddon[] }>(
      `/listings/${listingId}/addons${qs}`,
    );
  }

  async createAddon(
    listingId: string,
    body: {
      name: string;
      description?: string;
      price: number;
      icon?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.apiService.post<{ success: boolean; data: ServiceAddon }>(
      `/listings/${listingId}/addons`,
      body,
    );
  }

  async updateAddon(
    listingId: string,
    addonId: string,
    body: Partial<{
      name: string;
      description: string | null;
      price: number;
      icon: string | null;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.apiService.put<{ success: boolean; data: ServiceAddon }>(
      `/listings/${listingId}/addons/${addonId}`,
      body,
    );
  }

  async deleteAddon(listingId: string, addonId: string) {
    return this.apiService.delete<{ success: boolean; message?: string }>(
      `/listings/${listingId}/addons/${addonId}`,
    );
  }

  async createBooking(body: {
    storeId: string;
    listingId: string;
    appointmentDate: string;
    appointmentTime: string;
    addonIds?: string[];
  }) {
    return this.apiService.post<{ success: boolean; data: ServiceBooking }>(
      '/bookings',
      body,
    );
  }

  async getBooking(id: string) {
    return this.apiService.get<{ success: boolean; data: ServiceBooking }>(
      `/bookings/${id}`,
    );
  }
}

export const bookingService = new BookingService();
```

Export from `src/services/index.ts`:

```ts
export { bookingService } from './bookingService';
```

Add to `RootStackParamList` in `src/types/index.ts`:

```ts
  ChooseService: {
    storeId: string;
    listingId: string;
  };
  SelectBookingDateTime: {
    storeId: string;
    listingId: string;
    serviceTitle: string;
    servicePrice: number | null;
    currency?: string | null;
    priceType?: string | null;
    duration?: string | null;
  };
  ServiceBookingAddOns: {
    storeId: string;
    listingId: string;
    serviceTitle: string;
    servicePrice: number | null;
    currency?: string | null;
    priceType?: string | null;
    duration?: string | null;
    appointmentDate: string;
    appointmentTime: string;
  };
  BookingConfirmed: {
    bookingId: string;
  };
```

- [ ] **Step 4: Run Jest — expect PASS**

```bash
npx jest __tests__/bookingTotals.test.ts
```

- [ ] **Step 5: Commit (mobile)**

```bash
git add src/utils/bookingTotals.ts __tests__/bookingTotals.test.ts src/services/bookingService.ts src/services/index.ts src/types/index.ts
git commit -m "Add booking API client, totals helper, and navigation param types."
```

---

### Task 6: Choose Service screen + Book Now wire

**Files:**
- Create: `D:\Extra Work\support-mobile-app\src\screens\booking\ChooseServiceScreen.tsx`
- Modify: `D:\Extra Work\support-mobile-app\src\navigation\AppNavigator.tsx`
- Modify: `D:\Extra Work\support-mobile-app\src\screens\ServiceListingDetailScreen.tsx`

**Interfaces:**
- Consumes: `bookingService.getStoreServiceListings`, `formatListingPriceWithType`
- Route params: `{ storeId, listingId }`

- [ ] **Step 1: Implement ChooseServiceScreen**

Match marketplace theme (`Colors.light.marketplace`). Structure:

- SafeAreaView + header (back, title “Choose a Service”, close → `navigation.goBack()`)
- Provider card from `data.store` (logo, name, rating)
- FlatList of `data.listings`; highlight row when `item.id === highlightListingId || item.id === route.params.listingId`
- Row: title, 1-line description, duration, `formatListingPriceWithType({ price, priceType, currency })`, chevron
- On press → `navigation.navigate('SelectBookingDateTime', { storeId, listingId: item.id, serviceTitle: item.title, servicePrice: item.price, currency: item.currency, priceType: item.priceType, duration: item.duration })`
- Empty state if `listings.length === 0`
- Loading / error states with `ActivityIndicator`

(Full screen ~250–350 lines; follow `ServiceListingDetailScreen` style patterns for header/back.)

- [ ] **Step 2: Register in AppNavigator**

Import and:

```tsx
<Stack.Screen name="ChooseService" component={ChooseServiceScreen} options={{ headerShown: false }} />
```

(Also register stub imports for the other three screens in Tasks 7–8, or register them as they are created.)

- [ ] **Step 3: Wire Book Now**

In `ServiceListingDetailScreen.tsx`:

```ts
const handleBookNow = () => {
  const storeId = listing?.store?.id;
  if (!storeId) {
    Alert.alert('Unavailable', 'Booking requires a store listing');
    return;
  }
  navigation.navigate('ChooseService', {
    storeId,
    listingId: listing.id,
  });
};
```

- [ ] **Step 4: Manual verify**

Open Active store service → Book Now → Choose Service lists catalog with current first.

- [ ] **Step 5: Commit (mobile)**

```bash
git add src/screens/booking/ChooseServiceScreen.tsx src/navigation/AppNavigator.tsx src/screens/ServiceListingDetailScreen.tsx
git commit -m "Wire Book Now to Choose a Service catalog screen."
```

---

### Task 7: Select date & time screen

**Files:**
- Create: `D:\Extra Work\support-mobile-app\src\screens\booking\SelectBookingDateTimeScreen.tsx`
- Modify: `D:\Extra Work\support-mobile-app\src\navigation\AppNavigator.tsx` (register if not already)

**Interfaces:**
- Consumes: route params from ChooseService
- Produces: navigate to `ServiceBookingAddOns` with date/time

- [ ] **Step 1: Implement screen**

- Header “Select Date & Time”
- Summary chip: service title + price via `formatListingPriceWithType`
- Month calendar: disable dates before today (local midnight)
- Default time slots chips: `['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']`
- Primary CTA “Continue” enabled only when `selectedDate` and `selectedTime` set
- On continue:

```ts
navigation.navigate('ServiceBookingAddOns', {
  ...route.params,
  appointmentDate: selectedDateISO, // 'YYYY-MM-DD'
  appointmentTime: selectedTime,
});
```

Use simple custom calendar grid (no new dependency unless project already has one — check; prefer no new package).

- [ ] **Step 2: Manual verify** — past dates disabled; Continue navigates with params.

- [ ] **Step 3: Commit**

```bash
git add src/screens/booking/SelectBookingDateTimeScreen.tsx src/navigation/AppNavigator.tsx
git commit -m "Add booking date and time selection screen."
```

---

### Task 8: Add-ons confirm + Booking Confirmed

**Files:**
- Create: `D:\Extra Work\support-mobile-app\src\screens\booking\ServiceBookingAddOnsScreen.tsx`
- Create: `D:\Extra Work\support-mobile-app\src\screens\booking\BookingConfirmedScreen.tsx`
- Modify: `D:\Extra Work\support-mobile-app\src\navigation\AppNavigator.tsx`

**Interfaces:**
- Consumes: `bookingService.getAddons`, `createBooking`, `computeBookingTotals`
- Produces: Confirmed screen with `bookingId`

- [ ] **Step 1: Implement ServiceBookingAddOnsScreen**

- Load Active add-ons for `listingId`
- Multi-select toggles; running total via `computeBookingTotals(servicePrice, selected)`
- Primary CTA: `Confirm Booking · {formatted total}`
- Secondary: `Skip and confirm without extras` (same POST with `addonIds: []`)
- If addons empty: show message + single Confirm CTA (skip extras path)
- On confirm:

```ts
const response = await bookingService.createBooking({
  storeId,
  listingId,
  appointmentDate,
  appointmentTime,
  addonIds: selectedIds,
});
const booking = (response.data as any)?.data || response.data;
navigation.replace('BookingConfirmed', { bookingId: booking.id });
```

Handle errors with `Alert.alert`. Require auth — if 401, prompt login.

- [ ] **Step 2: Implement BookingConfirmedScreen**

- Fetch `bookingService.getBooking(bookingId)`
- Success icon + “Booking Confirmed”
- Summary: title, date, time, add-ons list, total
- CTA Done → `navigation.navigate('Home')` (or pop to ServiceListingDetail)

- [ ] **Step 3: Register both screens in AppNavigator**

- [ ] **Step 4: End-to-end manual verify** — create booking; Confirmed shows snapshots; Mongo `ServiceBooking` document exists.

- [ ] **Step 5: Commit**

```bash
git add src/screens/booking/ServiceBookingAddOnsScreen.tsx src/screens/booking/BookingConfirmedScreen.tsx src/navigation/AppNavigator.tsx
git commit -m "Add booking add-ons confirm and booking confirmed screens."
```

---

### Task 9: Seller Optional add-ons on ServiceListingScreen

**Files:**
- Modify: `D:\Extra Work\support-mobile-app\src\screens\ServiceListingScreen.tsx`

**Interfaces:**
- Consumes: `bookingService` CRUD
- Local draft type: `{ localId: string; id?: string; name: string; description: string; price: string; icon: string; isActive: boolean }`

- [ ] **Step 1: Add state + UI section**

Above wizard footer, add **Optional add-ons**:

- List rows (name, price, edit/delete)
- “Add add-on” opens modal: name (required), description, price (≥ 0), icon (optional emoji text), active Switch
- Hydrate from API when editing existing listing (`listingData.id`): `bookingService.getAddons(id, true)`

- [ ] **Step 2: Persist on save**

In `handleSaveAndContinue` after successful `createListing` / `updateListing`:

```ts
const listingId = savedListing.id; // from response
// For create: POST each draft addon
// For update: POST new (no id), PUT changed, DELETE removed ids
```

On **new listing**, keep drafts in local state until create succeeds, then batch `createAddon`.

- [ ] **Step 3: Manual verify** — create service with 2 add-ons; buyer flow shows them; edit removes one.

- [ ] **Step 4: Commit**

```bash
git add src/screens/ServiceListingScreen.tsx
git commit -m "Let sellers manage optional add-ons on service listing create and edit."
```

---

### Task 10: Polish empty/error states + verification

**Files:** touch-ups only in booking screens + detail alert copy

- [ ] **Step 1:** Confirm empty catalog empty-state copy; confirm no-store Book Now alert; loading/error on each booking screen.
- [ ] **Step 2:** Run backend helpers + mobile totals tests:

```bash
# backend
node --test src/helpers/bookingHelper.test.js
# mobile
npx jest __tests__/bookingTotals.test.ts
```

- [ ] **Step 3:** Walk success criteria from spec §10 and check off.
- [ ] **Step 4:** Commit any polish:

```bash
git commit -m "Polish service booking empty and error states."
```

---

## Self-review (spec coverage)

| Spec section | Task |
|--------------|------|
| §3.1 Buyer flow | 6–8 |
| §3.1 no storeId | 6 |
| §3.2 Seller add-ons | 9 |
| §4 models | 1 |
| §5.1 catalog | 2 |
| §5.2 add-ons API | 3 |
| §5.3 bookings | 4 |
| §6 screens | 6–8 |
| §7 seller UI | 9 |
| §8 non-goals | Not built (Stripe, inbox, etc.) |
| §10 success criteria | 10 |

No Stripe, no Event Book Now changes, no My Bookings tab — intentional.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-08-service-booking.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints  

Which approach?
