const router = require('express').Router();
const authController = require('./controllers/authController');
const categoryController = require('./controllers/categoryController');
const listingController = require('./controllers/listingController');
const regionController = require('./controllers/regionController');
const paymentController = require('./controllers/paymentController');
const stripeController = require('./controllers/stripeController');
const profileController = require('./controllers/profileController');
const seedController = require('./controllers/seedController');

const { jwtAuth, addReqUser } = require('./middlewares');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/signin', authController.signin);
router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/forgetPassword', authController.forgetPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/register-with-otp', authController.registerWithOTP);

// Public category and region routes (for SelectCategoryScreen, SelectRegionScreen)
router.get('/categories', categoryController.getCategories);
router.get('/event-types', categoryController.getEventTypes);
router.get('/service-types', categoryController.getServiceTypes);
router.get('/regions', regionController.getRegions);

// Public listing routes (for HomeScreen)
router.get('/listings', listingController.getListings);
router.get('/listings/:id', listingController.getListingById);

// Public payment plans (for PaymentScreen)
router.get('/payment-plans', paymentController.getPaymentPlans);
router.get('/promo-codes/validate', paymentController.validatePromoCode);
router.get('/stripe/payment-status', stripeController.getPaymentStatus);

// Seed endpoint (for development)
router.post('/seed', seedController.seedDatabase);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Apply authentication middleware
router.use(jwtAuth);
router.use(addReqUser);

// Auth routes
router.post('/auth/logout', authController.logout);

// Listing routes (for ProductListingScreen, EventListingScreen, ServiceListingScreen, PropertyListingScreen, ReviewScreen, PublishScreen)
router.post('/listings', listingController.createListing);
router.put('/listings/:id', listingController.updateListing);
router.post('/listings/:id/publish', listingController.publishListing);

// Region routes (for SelectRegionScreen)
router.get('/regions/recent', regionController.getRecentRegions);
router.post('/regions/recent', regionController.addRecentRegion);

// Payment routes (for PaymentScreen)
router.post('/subscriptions', paymentController.createSubscription);

// Stripe payment routes
router.post('/stripe/create-payment-intent', stripeController.createPaymentIntent);
router.post('/stripe/create-checkout-session', stripeController.createCheckoutSession);
router.post('/stripe/confirm-payment', stripeController.confirmPayment);

// Stripe webhook (must be before auth middleware - uses raw body)
// Note: Webhook route should be added in server.js with raw body parser

// Profile routes (for ProfileScreen)
router.get('/profile', profileController.getProfile);
router.get('/profile/browsing-history', profileController.getBrowsingHistory);
router.get('/profile/wishlist', profileController.getWishlist);
router.post('/profile/wishlist', profileController.addToWishlist);
router.delete('/profile/wishlist/:listingId', profileController.removeFromWishlist);
router.get('/profile/listings', profileController.getMyListings);

module.exports = {
  router,
};
