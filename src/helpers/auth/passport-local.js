const localStrategy = require('passport-local').Strategy;
const { validatePassword } = require("./user");
const { profileDal } = require('../../dal');
const { NotFound, Unauthorized } = require('../errors');
const passport = require('passport');
const { ERRORS } = require('../../consts');

const localStrategyMode = new localStrategy(async function verify(
  email,
  password,
  res,
) {
  try {
    let profile = await profileDal.getOneByEmail(email);
    if (!profile) {
      throw new NotFound(ERRORS.USER_NOT_EXIST, 404);
    }
    const validateUser = await validatePassword(profile, password);
    if (!validateUser) {
      throw new Unauthorized(ERRORS.UNAUTHORIZED, 401);
    }
    res.json(profile);
  } catch (err) {
    throw new Unauthorized(ERRORS.UNAUTHORIZED, 401);

  }
});


const authenticateWithPassport = (method, req, res) =>
  new Promise((resolve, reject) => {
    passport.use(localStrategy);
    passport.authenticate(method, { session: false }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    })(req, res);
  });
passport.use(localStrategy);


module.exports = {
  localStrategyMode,
  authenticateWithPassport
};