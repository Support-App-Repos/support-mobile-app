# Event Booking Flow — Design Spec

**Date:** 2026-09-09  
**Status:** Approved  
**Apps:** `support-mobile-app`, `support-backend`  
**Visual language:** Reuse service booking cards / confirmed look (no shared screens)

---

## 1. Goals

Enable buyers to book an **event listing** with a short flow:

1. **Book Now** on Event listing detail  
2. **EventBookTicketsScreen** — pick ticket quantity (1–5), see total  
3. **Confirm** → persist `EventBooking`  
4. **EventBookingConfirmedScreen**

No calendar. No add-ons. No reuse of service booking screens.

---

## 2. Decisions (locked)

| Topic | Decision |
|--------|----------|
| Data model | Dedicated **`EventBooking`** (not `ServiceBooking`) |
| Ticket quantity | Default **1**, min **1**, max **5** |
| Date / time | From listing `eventDate` / `eventTime` (snapshot) |
| Payment | Out of scope |
| Capacity vs remaining seats | Out of scope (hard cap 5 only) |
| Screens | New `EventBookTicketsScreen` + `EventBookingConfirmedScreen` |
| Auth | Required to confirm (same pattern as service bookings) |
| Store | Use listing `storeId` when present; seller from listing owner |

---

## 3. User flow

```
EventListingDetail
  → Book Now
EventBookTicketsScreen
  → Confirm Booking
POST /event-bookings
EventBookingConfirmedScreen
  → Done → Home
```

**Edge cases**

- Not logged in: prompt Login, then return / retry.  
- Listing not Active or not an event category: API 400.  
- Missing event date/time: still allow booking; show “Date pending” / “Time pending” in UI; store null/empty strings as needed.  
- No store on listing: booking still created with `storeId` null and `sellerUserId` = listing owner.

---

## 4. Data model — `EventBooking`

| Field | Type | Notes |
|--------|------|--------|
| id | ObjectId | |
| storeId | ObjectId? | From listing when present |
| listingId | ObjectId | Event listing |
| buyerUserId | ObjectId | |
| sellerUserId | ObjectId | Listing owner |
| eventTitle | string | Snapshot |
| eventPrice | number | Unit price snapshot |
| currency | string? | |
| priceType | string? | |
| eventDate | string? | ISO date or listing string |
| eventTime | string? | |
| location | string? | venue / location line snapshot |
| ticketQuantity | int | 1–5 |
| totalAmount | number | unit × qty |
| status | string | default `Confirmed` |
| createdAt / updatedAt | DateTime | |

---

## 5. API

### `POST /event-bookings` (auth)

Body: `{ listingId, ticketQuantity, storeId? }`

- Validate qty integer 1–5  
- Listing Active + event category  
- If `storeId` sent, must match listing’s store  
- Snapshot title, price, currency, date/time, location  
- `totalAmount = eventPrice * ticketQuantity`  
- Returns created booking  

### `GET /event-bookings/:id` (auth)

Buyer or seller only.

---

## 6. Mobile UI

### EventBookTicketsScreen

- Gray screen `#F2F2F2`, white cards, primary `#1B4F72` prices  
- Summary: image, title, date · time, location, unit price  
- Qty stepper − / + (1–5)  
- Footer: Total + green Confirm CTA `#27AE60`  

### EventBookingConfirmedScreen

- Success icon, “Booking Confirmed”  
- Summary: event, date, time, tickets, total  
- Done → Home  

### EventListingDetailScreen

- **Book Now** navigates to `EventBookTickets` with listing params (not phone call).  
- Call action remains on phone icon if present.

---

## 7. Out of scope

- Stripe / payment  
- Seller event-booking inbox UI  
- Enforcing `maxCapacity` remaining seats  
- Calendar / add-ons  

---

## 8. Acceptance

1. Book Now opens ticket screen (not dialer).  
2. Qty cannot go below 1 or above 5.  
3. Confirm creates `EventBooking` and opens confirmed screen.  
4. Confirmed screen shows event + tickets + total.  
5. Service booking flow unchanged.
