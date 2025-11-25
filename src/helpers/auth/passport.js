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
        const { phone, username, location } = req.body;
        let data;
        if (email && password && phone && username && location) {
          data = {
            username: username,
            phone: phone,
            email: email,
            location: location,
          }
        } else {
          throw new BadRequest('Bad Parameter');
        }
        const profile = await profileService.create({ email, password, ...data });
        if (profile) {
          try {
            emailService.sendUserRegisterEmail({
              email: email,
              name: data?.username
            });
          } catch (error) {
          }
        }
        const token = generateToken(profile);
        return done(null, profile, { message: SUCCESS_MESSAGES.SIGN_UP, token });
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
      const { userType } = req.body
      try {
        if (!email && !password) {
          throw new BadRequest('Bad Parameter');
        }
        let profile = await profileDal.getOneByEmail(email);
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
