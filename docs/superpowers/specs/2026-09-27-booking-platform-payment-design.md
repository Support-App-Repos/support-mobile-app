# Booking Stripe Payment (Platform Only) — Design

**Date:** 2026-09-27  
**Status:** Implemented

## Goal

Charge buyers for Service and Event bookings via Stripe Payment Sheet to the **platform** account (same model as listing publish fees). Show Booking Confirmed only after successful payment when total > 0. Free bookings skip payment.

## Flow

### Service
Choose service → date/time → add-ons → if total > 0: Payment Sheet → create booking with `paymentIntentId` → Booking Confirmed. If free: create booking → Confirmed.

### Event
Tickets → if total > 0: Payment Sheet → create booking with `paymentIntentId` → Event Booking Confirmed. If free: skip pay.

## Backend

- `POST /stripe/create-booking-payment-intent` — body: `{ type: 'service'|'event', listingId, addonIds?, ticketQuantity?, currency? }`
- Server recalculates amount from listing (+ add-ons / tickets)
- PaymentIntent charged to platform Stripe account
- `POST /bookings` and `POST /event-bookings` accept optional `paymentIntentId`
- Paid bookings require succeeded PaymentIntent; free bookings do not
- Persist `payment_status`, `stripe_payment_intent_id` on booking docs

## Mobile

- Reuse Stripe RN Payment Sheet
- Wire confirm CTAs on ServiceBookingAddOnsScreen and EventBookTicketsScreen

## Out of scope

- Stripe Connect / seller payouts
- Platform commission UI
- Refunds UI
