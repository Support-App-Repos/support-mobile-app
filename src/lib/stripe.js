/**
 * Stripe Client Singleton
 * Initializes and exports Stripe client instance
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;


