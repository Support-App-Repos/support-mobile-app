const createError = require('http-errors');
const jwt = require('jwt-simple');
const passport = require("passport");
const localStrategy = require('passport-local').Strategy;
const { validatePassword } = require("./user");
const { generateToken } = require("../token");
const { SUCCESS_MESSAGES, ERRORS, SOCIAL_AUTH, COMMON } = require('../../consts');
const { profileDal } = require("../../dal");
const { profileService } = require("../../services/profileService");
const emailService = require('../../helpers/email');

const {
  BadRequest
} = require('../errors');

passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        const { phone, username, firstName, lastName, location } = req.body;
        let data = {};
        
        // Make fields optional - only require email and password
        if (username) data.username = username;
        if (phone) data.phone = phone;
        if (location) data.location = location;
        
        // Handle firstName and lastName separately
        if (firstName) data.firstName = firstName.trim();
        if (lastName) data.lastName = lastName.trim();
        
        // Generate displayName from firstName + lastName
        if (firstName && lastName) {
          data.displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
        } else if (firstName) {
          data.displayName = firstName.trim();
        } else if (lastName) {
          data.displayName = lastName.trim();
        } else if (username) {
          // Fallback to username if firstName/lastName not provided
          data.displayName = username.trim();
        }
        
        if (!email || !password) {
          throw new BadRequest('Email and password are required');
        }
        
        const profile = await profileService.create({ email, password, ...data });
        if (profile) {
          try {
            // Use displayName or firstName or username or email for email name
            const nameForEmail = profile.displayName || profile.firstName || data?.username || email;
            emailService.sendUserRegisterEmail({
              email: email,
              name: nameForEmail
            });
          } catch (error) {
            // Email sending failure shouldn't block registration
            console.error('[Auth] Email send error:', error);
          }
        }
        const token = generateToken(profile);
        return done(null, profile, { message: SUCCESS_MESSAGES.SIGN_UP || 'Sign up successful', token });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  'signin',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        if (!email || !password) {
          throw new BadRequest('Email and password are required');
        }
        const profile = await profileDal.getOneByEmail(email);
        if (!profile) {
          return done(createError(404, ERRORS.USER_NOT_EXIST), null);
        }
        const validateUser = await validatePassword(profile, password);
        if (!validateUser) {
          return done(createError(401, ERRORS.INCORRECT_EMAIL_OR_PASSWORD), null);
        }
        const token = generateToken(profile);
        return done(null, profile, { message: SUCCESS_MESSAGES.LOG_IN, token });
      } catch (error) {
        return done(error);
      }
    }
  )
);
