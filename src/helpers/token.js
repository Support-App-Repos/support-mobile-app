const jwt = require('jwt-simple');
const { serialize, parse } = require('cookie');
const { Unauthorized } = require('./errors');
const { COMMON, ERRORS } = require('../consts');

const jwtSectetKey = process.env.JWT_SECRET_KEY

const tokenModule = {
  generateToken: function (user) {
    delete user['password'];
    delete user['salt'];
    delete user['resetToken'];
    const token = jwt.encode({
      sub: user,
      iat: COMMON.JWT_IAT
    }, jwtSectetKey);
    try {
      tokenModule.setTokenCookie(token, true);
    } catch (error) {
      console.log(ERRORS.GENERATE_TOKEN_ERROR, error);
    }
    return token;
  },
  verifyToken: function (token) {
    try {
      const decode = jwt.decode(token, jwtSectetKey);
      return decode;
    } catch (e) {
      throw new Unauthorized('Token is not verified.');
    }
  },
  getToken: () => {
    return new Cookies().get(Constants.TOKEN);
  },
  getTokenExpires(token) {
    let expires;
    try {
      const verifiedToken = tokenModule.verifyToken(token);

      expires = new Date(verifiedToken.iat);
    } catch (err) {
      expires = new Date();
    }
    return expires;
  },
  removeToken: () => {
    new Cookies().remove('token', { path: '/' });
  },
  getTokenFromCookie(req) {
    const cookie = req.headers.cookie;
    const cookies = parse(cookie || '');
    return cookies['token'];
  },
  setTokenCookie: (token, newToken) => {
    let expires = new Date(COMMON.JWT_IAT);
    if (!newToken) {
      expires = tokenModule.getTokenExpires(token);
    }
    const cookie = serialize('token', token, {
      expires,
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: false,
    });
    return cookie;
  }
};

module.exports = tokenModule;