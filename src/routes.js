const router = require('express').Router();
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');

const { jwtAuth, addReqUser } = require('./middlewares');

// Configure multer for file storage
const multer = require('multer')
const upload = multer();

router.use(jwtAuth);
router.use(addReqUser);

/*======================== Auth =======================*/
router.post('/auth/logout', authController.logout);

router.post('/auth/signup', authController.signup);
router.post('/auth/signin', authController.signin);
router.post("/auth/forgetPassword", authController.forgetPassword);

router.get('/auth/social', authController.socialAuthenticate);
router.get('/auth/social/callback', authController.socialAuthenticateCallback);

router.get('/auth/tiktok', authController.tiktokSignIn);
router.get('/auth/tiktok/callback/', authController.tiktokSignInCallback);

router.get('/auth/twitter/callback', authController.twitterSignInCallback);

router.get('/auth/snapchat/callback', authController.snapchatSignInCallback);

router.get('/auth/instagram', authController.instagramSignIn);
router.get('/auth/instagram/callback', authController.instagramSignInCallback);

/*======================== Products =======================*/
router.put('/upload-images', upload.any(), productController.uploadImages);

module.exports = {
  router,
};
