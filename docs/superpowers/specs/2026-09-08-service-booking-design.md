# Service Booking Flow — Design Spec

**Date:** 2026-09-08  
**Status:** Approved  
**Apps:** `support-mobile-app`, `support-backend`  
**Figma:** Support file — frames `choose service` (`1179:6569`), `date nd time` (`1180:52`), add-ons / confirm, `booking confirm` (`1180:1112`)

---

## 1. Goals

Enable buyers to book a service from a store’s real service catalog end-to-end:

1. **Book Now** on a service listing  
2. **Choose a Service** (dynamic list)  
3. **Select date & time**  
4. **Optional add-ons** (real per-listing catalog)  
5. **Confirm Booking** → persisted booking  
6. **Booking Confirmed**

Sellers manage bookable services via existing **service listings**, and manage **add-ons** on those listings.

---

## 2. Decisions (locked)

| Topic | Decision |
|--------|----------|
| Catalog source | Existing **Active service listings** for the listing’s **store** |
| Highlighting | Current listing appears **first** and is **pre-highlighted** |
| Add-ons | **Real model** per service listing |
| Booking persistence | **Yes** — save `ServiceBooking` on confirm |
| Payment on confirm | **Out of scope** for this pass (no Stripe for bookings) |
| Event Book Now | Unchanged (not part of this flow) |
| Availability engine | Simple UI slots; no full seller calendar blocking in v1 |

---

## 3. User flows

### 3.1 Buyer

```
ServiceListingDetail
  → Book Now
ChooseServiceScreen (store Active services; current first)
  → tap service
SelectDateTimeScreen
  → continue
ServiceAddOnsScreen (optional; skip allowed)
  → Confirm Booking
POST booking
BookingConfirmedScreen
```

**Empty / edge cases**

- Listing has **no `storeId`**: show alert (“Booking requires a store listing”) and do not open flow.  
- Store has **no other Active services**: still show at least the current listing if Active.  
- Current listing not Active: still open catalog of Active services; if none, show empty state.  
- Add-ons empty: skip add-ons screen or show empty + “Skip and confirm”.

### 3.2 Seller (add-ons)

- On **Create Service** and **Edit Service** listing screens: section **“Optional add-ons”**  
  - Fields: name (required), description (optional), price (required ≥ 0), optional emoji/icon key, active toggle  
  - Add / edit / remove before publish or on update  
- Add-ons saved with the listing (create after listing id exists; on create flow, buffer locally then POST after listing is created, or save on each step after listing id is known)

---

## 4. Data model

### 4.1 `ServiceAddon` (Mongo / Prisma)

| Field | Type | Notes |
|--------|------|--------|
| `id` | ObjectId | |
| `listingId` | ObjectId | Parent service listing |
| `storeId` | ObjectId? | Denormalized for queries |
| `userId` | ObjectId | Owner |
| `name` | string | Required |
| `description` | string? | |
| `price` | float | Required, ≥ 0 |
| `icon` | string? | Emoji or key (e.g. `scissors`) |
| `isActive` | boolean | default true |
| `sortOrder` | int | default 0 |
| `createdAt` / `updatedAt` | datetime | |

Indexes: `listingId`, `storeId`, `userId`.

### 4.2 `ServiceBooking`

| Field | Type | Notes |
|--------|------|--------|
| `id` | ObjectId | |
| `storeId` | ObjectId | |
| `listingId` | ObjectId | Chosen service |
| `buyerUserId` | ObjectId | Authenticated buyer |
| `sellerUserId` | ObjectId | Listing owner |
| `serviceTitle` | string | Snapshot |
| `servicePrice` | float | Snapshot |
| `currency` | string? | Snapshot |
| `priceType` | string? | Snapshot |
| `duration` | string? | Snapshot from listing |
| `appointmentDate` | string or Date | Local date (ISO date) |
| `appointmentTime` | string | e.g. `10:00 AM` |
| `addonIds` | ObjectId[] | Selected add-ons |
| `addonsSnapshot` | array | `{ id, name, price }[]` |
| `addonsTotal` | float | |
| `totalAmount` | float | service + addons |
| `status` | string | `Confirmed` \| `Cancelled` \| `Completed` (v1: create as `Confirmed`) |
| `notes` | string? | optional later |
| `createdAt` / `updatedAt` | datetime | |

Indexes: `buyerUserId`, `sellerUserId`, `storeId`, `listingId`, `appointmentDate`.

---

## 5. API

All write routes require `jwtAuth` + ownership checks where noted.

### 5.1 Store service catalog

`GET /stores/:storeId/service-listings?highlightListingId=`

- Returns Active listings in Services category for that store  
- If `highlightListingId` provided, that listing is first (if present and Active)  
- Shape: id, title, description, price, priceType, currency, duration, specialization, photos, ratingAverage, store summary fields as needed for header card

### 5.2 Add-ons

- `GET /listings/:listingId/addons` — public for Active add-ons (booking UI)  
- `GET /listings/:listingId/addons?all=1` — owner sees inactive too  
- `POST /listings/:listingId/addons` — owner  
- `PUT /listings/:listingId/addons/:addonId` — owner  
- `DELETE /listings/:listingId/addons/:addonId` — owner  

### 5.3 Bookings

- `POST /bookings`  
  Body: `{ storeId, listingId, appointmentDate, appointmentTime, addonIds?: string[] }`  
  Server validates listing Active + belongs to store, add-ons belong to listing & Active, computes totals, snapshots, returns booking  
- `GET /bookings/:id` — buyer or seller only  

---

## 6. Mobile screens

| Screen | Route name | Notes |
|--------|------------|--------|
| Choose a Service | `ChooseService` | Provider header from store / listing owner; list of services |
| Select date & time | `SelectBookingDateTime` | Calendar + time slots; selected service summary chip |
| Add-ons | `ServiceBookingAddOns` | Multi-select; total; Confirm / Skip |
| Booking confirmed | `BookingConfirmed` | Success + summary; CTA back to Home / listing |

Wire **ServiceListingDetailScreen** `Book Now` → `ChooseService` with `{ storeId, listingId }`.

Match Figma layout/spacing/colors using existing theme tokens (`Colors.light.marketplace`, etc.).

### 6.1 Choose a Service (dynamic)

- Header: back, title, close (close pops to service detail or store)  
- Provider card: store logo / owner avatar, store or business name, specialization or “Service Provider”, rating badge  
- Rows: icon, title, description (1 line), duration, price (+ price type via `formatListingPriceWithType`), chevron  
- Highlight current listing (border / background)  
- Tap → navigate with selected `listingId` (+ storeId)

### 6.2 Date & time

- Selected service summary  
- Month calendar; available vs booked styling (v1: mark past dates disabled; optional mock “booked” only if we have conflicting bookings for that listing)  
- Time slot chips for selected day  
- Primary CTA enabled when date + time selected  

### 6.3 Add-ons

- Load add-ons for selected listing  
- Toggle select; show running total (service base + add-ons)  
- **Confirm Booking · $X** / **Skip and confirm without extras**

### 6.4 Confirmed

- Success state from Figma  
- Show service, date, time, add-ons, total  
- Done → Home or Service detail

---

## 7. Seller UI for add-ons

On `ServiceListingScreen` (create/edit):

- Section title: **Optional add-ons**  
- List of draft add-ons + “Add add-on”  
- Modal or inline form: name, description, price, icon (emoji picker or short text)  
- Persist:
  - **Edit existing listing:** CRUD via add-ons API immediately or on Save  
  - **New listing:** keep local state; after `createListing` succeeds, batch `POST` add-ons  

---

## 8. Non-goals (this pass)

- Stripe / wallet payment for bookings  
- Seller availability rules / staff calendars  
- Push notifications for new bookings (can follow up)  
- Buyer “My Bookings” tab (optional follow-up; API supports `GET` by id)  
- Reschedule / cancel UI (status field exists for later)

---

## 9. Implementation phases

1. Backend: Prisma/Mongo models + add-ons + catalog + booking APIs  
2. Mobile: Book Now → Choose Service (catalog)  
3. Mobile: Date & time  
4. Mobile: Add-ons + Confirm + Confirmed  
5. Mobile: Seller add-ons on Service create/edit  
6. Polish + empty/error states  

---

## 10. Success criteria

- Book Now on a store-owned Active service opens Choose a Service with that store’s Active services, current first  
- Selecting a service and completing date/time (+ optional add-ons) creates a `ServiceBooking`  
- Confirmed screen shows correct snapshots and totals  
- Owner can add/edit/remove add-ons on a service listing and they appear in the booking extras step  
- No payment required to confirm in v1  

---

## 11. Open follow-ups (not blocking v1)

- Seller inbox of bookings  
- Conflict detection when two buyers pick same slot  
- Booking payments  

---

**Please review this spec.** If it looks right, reply to approve and we will write the implementation plan next. If anything should change, list edits against the section numbers above.
