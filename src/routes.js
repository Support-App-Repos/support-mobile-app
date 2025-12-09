const router = require('express').Router();
const authController = require('./controllers/authController');

const { jwtAuth, addReqUser } = require('./middlewares');

// Public auth routes (no authentication required)
router.post('/auth/signup', authController.signup);
router.post('/auth/signin', authController.signin);

router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/forgetPassword', authController.forgetPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/register-with-otp', authController.registerWithOTP);

// Protected routes (authentication required)
router.use(jwtAuth);

router.use(addReqUser);

router.post('/auth/logout', authController.logout);

module.exports = {
  router,
};
