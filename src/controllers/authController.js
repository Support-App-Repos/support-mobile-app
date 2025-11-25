const passport = require('passport');
const { COMMON, ERRORS, SOCIAL_AUTH } = require('../consts');
const {
  profileDal,
} = require('../dal');
const {
  errors,
  Forbidden,
  Unauthorized,
  UnprocessableEntity,
  NotFound,
} = require('../helpers/errors');
const { auth } = require('../helpers/auth');
const emailService = require('../helpers/email');
const { generateToken } = require('../helpers/token');

const authController = {};

authController.signup = async (req, res, next) => {
  try {
    passport.authenticate('signup', async (error, user, info) => {
      try {
        if (error) {
          return res.status(error?.status || 500).send(error.message);
        }
        return res.status(200).json({ user, info });
      } catch (error) {
        errors.handleError(res, error, ERRORS.SIGN_UP);
      }
    })(req, res, next);
  } catch (error) {
    console.log(ERRORS.SIGN_UP, err)
  }
};

authController.signin = async (req, res, next) => {
  try {
    passport.authenticate('signin', async (error, user, info) => {
      try {
        if (error) {
          return res.status(error?.status || 500).send(error.message);
        }
        return res.status(200).json({ user, info });
      } catch (error) {
        errors.handleError(res, error, ERRORS.SIGN_UP);
      }
    })(req, res, next);
  }
  catch (err) {
    console.log(ERRORS.SIGN_IN, err)
  }
};

authController.socialAuthenticate = (req, res, next) => {
  try {
    let platform = req.query.platform;
    passport.authenticate(auth.getStrategy(platform), {
      ...auth.getScopes(platform), callbackURL: auth.getCallbackUrl(platform)
    })(req, res, next);
  } catch (err) {
    console.log("Invalid Platform", err)
  }
}

authController.socialAuthenticateCallback = async (req, res, next) => {
  try {
    auth.authenticate(req.query.platform, req, res, next);
  } catch (err) {
    console.log(ERRORS.SIGN_IN, err)
  }
}

authController.snapchatSignInCallback = async (req, res, next) => {
  try {
    auth.authenticate(SOCIAL_AUTH.SNAPCHAT, req, res, next);
  } catch (err) {
    console.log(ERRORS.SIGN_IN, err)
  }
};

authController.twitterSignInCallback = async (req, res, next) => {
  try {
    auth.authenticate(SOCIAL_AUTH.TWITTER, req, res, next);
  } catch (err) {
    console.log(ERRORS.SIGN_IN, err)
  }
};

authController.tiktokSignIn = passport.authenticate(SOCIAL_AUTH.TIKTOK);

authController.tiktokSignInCallback = async (req, res) => {
  try {
    auth.authenticate(SOCIAL_AUTH.TIKTOK, req, res);
  } catch (err) {
    console.log(ERRORS.SIGN_IN, err)
  }
};

authController.instagramSignIn = passport.authenticate(SOCIAL_AUTH.INSTAGRAM, {
  // public_actions: [
  //   SOCIAL_AUTH.PUBLIC_PROFILE,
  //   SOCIAL_AUTH.EMAIL,
  //   SOCIAL_AUTH.USER_PHOTOS,
  // ]
  scope: ['user_profile', 'user_media']
});

authController.instagramSignInCallback = async (req, res) => {
  try {
    auth.authenticate(SOCIAL_AUTH.INSTAGRAM, req, res);
  } catch (err) {
    console.log(ERRORS.SIGN_IN, err)
  }
};

authController.logout = async (req, res) => {
  auth.removeTokenCookie(res);
  res.json();
};

authController.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    let profile = await profileDal.getOneByEmail(email);
    if (!profile) {
      return res.status(401).send(ERRORS.USER_NOT_EXIST);
    }
    const resetToken = generateToken(profile);
    emailService.sendResetPasswordEmail({
      email: profile.email,
      recipientFirstName: profile.username,
      resetPageUrl: `${process.env.HOST}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`
    });
    res.status(200).json({ message: COMMON.RESET_PASSWORD_EMAIL_SENT })
  }
  catch (error) {
    res.status(500).send(ERRORS.UNEXPECTED_ERROR)
  }
};

module.exports = authController;
