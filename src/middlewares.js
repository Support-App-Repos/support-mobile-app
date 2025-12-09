const { ERRORS } = require('./consts');
const { profileDal } = require('./dal/index');
const { Unauthorized } = require('./helpers/errors');
const { verifyToken, setTokenCookie, getTokenFromCookie } = require('./helpers/token');

const ignoredRoutes = [
  '/auth/signup',
  '/auth/signin',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/forgetPassword',
  '/auth/reset-password',
  '/auth/register-with-otp',
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
  const routePath = req.path.replace(/^\/api/, '') || req.path;
  const originalPath = req.originalUrl || req.path;
  
  const isPublicRoute = 
    req.method === 'GET' || 
    ignoredRoutes.includes(routePath) || 
    ignoredRoutes.includes(req.path) || 
    ignoredRoutes.includes(originalPath) ||
    routePath.startsWith('/auth/signup') ||
    routePath.startsWith('/auth/signin') ||
    routePath.startsWith('/auth/send-otp') ||
    routePath.startsWith('/auth/verify-otp') ||
    routePath.startsWith('/auth/forgetPassword') ||
    routePath.startsWith('/auth/reset-password') ||
    routePath.startsWith('/auth/register-with-otp');
  
  if (isPublicRoute) {
    return next();
  }

  const authStr = req.header('Authorization');
  if (authStr) {
    const token = authStr.split(' ')[1];
    try {
      const user = verifyToken(token);
      if (user) {
        req.userPayload = user;
        const cookie = setTokenCookie(token);
        res.setHeader('Set-Cookie', cookie);
        return next();
      }
    } catch (error) {
      // Invalid token, continue to check cookie
    }
  }

  const token = getTokenFromCookie(req);
  if (token) {
    try {
      const user = verifyToken(token);
      if (user) {
        req.userPayload = user;
        return next();
      }
    } catch (error) {
      // Invalid token
    }
  }
  
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please login first.',
  });
};

module.exports = {
  addReqUser,
  jwtAuth,
};
