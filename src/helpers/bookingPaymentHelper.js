/**
 * Verify a Stripe PaymentIntent for a booking (platform charge).
 */
const stripe = require('../lib/stripe');
const { normalizeStripeCurrency } = require('./bookingHelper');

async function assertSucceededBookingPaymentIntent({
  paymentIntentId,
  userId,
  listingId,
  bookingType,
  expectedAmount,
  expectedCurrency,
}) {
  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    const err = new Error('paymentIntentId is required for paid bookings');
    err.status = 400;
    throw err;
  }

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!pi) {
    const err = new Error('Payment intent not found');
    err.status = 404;
    throw err;
  }

  if (pi.status !== 'succeeded') {
    const err = new Error('Payment has not succeeded yet');
    err.status = 400;
    throw err;
  }

  if (pi.metadata?.purpose !== 'booking') {
    const err = new Error('Payment intent is not for a booking');
    err.status = 400;
    throw err;
  }

  if (pi.metadata?.userId && String(pi.metadata.userId) !== String(userId)) {
    const err = new Error('Payment intent does not belong to this user');
    err.status = 403;
    throw err;
  }

  if (pi.metadata?.listingId && String(pi.metadata.listingId) !== String(listingId)) {
    const err = new Error('Payment intent does not match this listing');
    err.status = 400;
    throw err;
  }

  if (pi.metadata?.bookingType && String(pi.metadata.bookingType) !== String(bookingType)) {
    const err = new Error('Payment intent does not match this booking type');
    err.status = 400;
    throw err;
  }

  const expectedCents = Math.round(Number(expectedAmount) * 100);
  if (expectedCents > 0 && pi.amount !== expectedCents) {
    const err = new Error('Payment amount does not match booking total');
    err.status = 400;
    throw err;
  }

  const currency = normalizeStripeCurrency(expectedCurrency);
  if (pi.currency && pi.currency !== currency) {
    const err = new Error('Payment currency does not match listing currency');
    err.status = 400;
    throw err;
  }

  return pi;
}

module.exports = {
  assertSucceededBookingPaymentIntent,
};
