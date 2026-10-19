const router = require('express').Router();
const authController = require('./controllers/authController');
const categoryController = require('./controllers/categoryController');
const listingController = require('./controllers/listingController');
const regionController = require('./controllers/regionController');
const paymentController = require('./controllers/paymentController');
const stripeController = require('./controllers/stripeController');
const bookingStripeController = require('./controllers/bookingStripeController');
const profileController = require('./controllers/profileController');
const seedController = require('./controllers/seedController');
const uploadController = require('./controllers/uploadController');
const storeController = require('./controllers/storeController');
const serviceBookingController = require('./controllers/serviceBookingController');
const serviceAddonController = require('./controllers/serviceAddonController');
const eventBookingController = require('./controllers/eventBookingController');

const { jwtAuth, addReqUser } = require('./middlewares');
const { uploadMultiple } = require('./middlewares/upload');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/signin', authController.signin);
router.post('/auth/login', authController.signin); // Alias for admin portal
router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/forgetPassword', authController.forgetPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/register-with-otp', authController.registerWithOTP);
router.post('/auth/google', authController.googleSignIn);

// Public category and region routes (for SelectCategoryScreen, SelectRegionScreen)
router.get('/categories', categoryController.getCategories);
router.get('/event-types', categoryController.getEventTypes);
router.get('/service-types', categoryController.getServiceTypes);
router.get('/regions', regionController.getRegions);

// Public listing routes (for HomeScreen)
router.get('/listings', listingController.getListings);
router.get('/listings/:listingId/addons', serviceAddonController.getAddons);
router.get('/listings/:id', listingController.getListingById);

// Store owner routes (must be before /stores/:id to avoid "me" matching as id)
router.get('/stores/me', jwtAuth, addReqUser, storeController.getMyStore);
router.get('/stores/me/dashboard', jwtAuth, addReqUser, storeController.getStoreDashboard);
router.get('/stores/me/bookings', jwtAuth, addReqUser, storeController.getMyStoreBookings);

// Public store routes
router.get(
  '/stores/:storeId/service-listings',
  serviceBookingController.getStoreServiceListings,
);
router.get('/stores/:id', storeController.getStoreById);
router.get('/stores/:id/listings', storeController.getStoreListings);
router.get('/stores/:id/reviews', storeController.getStoreReviews);

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

router.post('/bookings', serviceBookingController.createBooking);
router.get('/bookings/:id', serviceBookingController.getBookingById);
router.post('/event-bookings', eventBookingController.createEventBooking);
router.get('/event-bookings/:id', eventBookingController.getEventBookingById);

const productOrderController = require('./controllers/productOrderController');
router.post('/product-orders', productOrderController.createProductOrder);

// Auth routes
router.post('/auth/logout', authController.logout);

// Listing routes (for ProductListingScreen, EventListingScreen, ServiceListingScreen, PropertyListingScreen, ReviewScreen, PublishScreen)
router.post('/listings', listingController.createListing);
router.post('/listings/:listingId/addons', serviceAddonController.createAddon);
router.put('/listings/:listingId/addons/:addonId', serviceAddonController.updateAddon);
router.delete('/listings/:listingId/addons/:addonId', serviceAddonController.deleteAddon);
router.put('/listings/:id', listingController.updateListing);
router.delete('/listings/:id', listingController.deleteListing);
router.post('/listings/:id/publish', listingController.publishListing);
router.put('/listings/:id/owner-status', listingController.ownerUpdateListingStatus);
router.put('/listings/:id/status', listingController.updateListingStatus); // Admin: Update listing status (approve/reject)

// Store routes
router.post('/stores', storeController.createStore);
router.put('/stores/:id', storeController.updateStore);
router.post('/stores/:id/verification', storeController.submitVerification);
router.put('/stores/:id/verification', storeController.updateVerificationStatus);

// Admin routes
const adminController = require('./controllers/adminController');
router.get('/admin/dashboard', adminController.getDashboard);
router.get('/admin/stores', adminController.getAdminStores);
router.get('/admin/listings', adminController.getAdminListings);
router.get('/admin/stores/:id/documents', adminController.getStoreDocuments);
router.put('/admin/stores/:id/status', adminController.updateStoreStatus);

// Region routes (for SelectRegionScreen)
router.get('/regions/recent', regionController.getRecentRegions);
router.post('/regions/recent', regionController.addRecentRegion);

// Payment routes (for PaymentScreen)
router.post('/subscriptions', paymentController.createSubscription);

// Stripe payment routes
router.get('/stripe/check-subscription-validity', stripeController.checkSubscriptionValidity);
router.post('/stripe/create-payment-intent', stripeController.createPaymentIntent);
router.post('/stripe/create-booking-payment-intent', bookingStripeController.createBookingPaymentIntent);
router.post('/stripe/create-checkout-session', stripeController.createCheckoutSession);
router.post('/stripe/confirm-payment', stripeController.confirmPayment);

// Stripe webhook (must be before auth middleware - uses raw body)
// Note: Webhook route should be added in server.js with raw body parser

// Profile routes (for ProfileScreen)
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile); // Update current user's profile
router.get('/profile/browsing-history', profileController.getBrowsingHistory);
router.get('/profile/wishlist', profileController.getWishlist);
router.post('/profile/wishlist', profileController.addToWishlist);
router.delete('/profile/wishlist/:listingId', profileController.removeFromWishlist);
router.get('/profile/listings', profileController.getMyListings);
router.delete('/profile', profileController.deleteAccount);

// Admin routes
router.get('/users', profileController.getAllUsers); // Admin: Get all users
router.put('/users/:id', profileController.updateUser); // Admin: Update user

// Upload routes (for image uploads) - Protected
router.post('/upload/images', (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error:', err);
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File size too large. Maximum size is 10MB per file.'
          : err.code === 'LIMIT_FILE_COUNT'
            ? 'Too many files. Maximum is 10 images at once.'
            : err.message || 'Failed to process uploaded files';
      return res.status(400).json({ success: false, message });
    }
    return next();
  });
}, uploadController.uploadImages);
router.delete('/upload/images/:imageUrl', uploadController.deleteImage);

module.exports = {
  router,
};
