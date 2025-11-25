const { ERRORS } = require('./consts');
const { profileDal } = require('./dal/index');
const { Unauthorized } = require('./helpers/errors');
const { verifyToken, setTokenCookie, getTokenFromCookie } = require('./helpers/token');

const ignoredRoutes = [
  '/auth/signup',
  '/auth/signin',
  '/auth/forgetPassword',
  '/profiles/resetPassword'
]

const addReqUser = async (req, res, next) => {
  if (req.userPayload) {
    const user = req.userPayload;
    return profileDal
      .getOneByEmail(user.sub.email)
      .then((profile) => {
        return profile;
      })
      .then((profile) => {
        req.user = profile;
        next();
      })
      .catch(() => {
        req.user = undefined;
        next();
      });
  }
  next();
}

const jwtAuth = (req, res, next) => {
  if (req.method == 'GET' || ignoredRoutes.includes(req.path)) {
    return next();
  }

  const authStr = req.header('Authorization');
  if (authStr) {
    const token = authStr.split(' ')[1];
    const user = verifyToken(token);
    if (user) {
      req.userPayload = user;
      const cookie = setTokenCookie(token);
      res.setHeader('Set-Cookie', cookie);
      return next();
    }
  } else {
    throw new Unauthorized(ERRORS.UNAUTHORIZED);
  }

  const token = getTokenFromCookie(req);
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.userPayload = user;
    }
  } else {
    throw new Unauthorized(ERRORS.UNAUTHORIZED);
  }
  next();
};

module.exports = {
  addReqUser,
  jwtAuth,
};
