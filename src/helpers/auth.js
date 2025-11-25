const passport = require('passport');
const { errors } = require('../helpers/errors');
const { serialize, parse } = require('cookie');
const { SOCIAL_AUTH } = require('../consts');

const TOKEN_NAME = 'token';

class AuthBase {
  constructor() {
  }

  isTokenValid(DIDToken) {
    throw new Error('isTokenValid should be implemented in child');
  }

  getIssuer(DIDToken) {
    throw new Error('getIssuer should be implemented in child');
  }

  async getMetadata(issuer) {
    throw new Error('getMetadata should be implemented in child');
  }

  getTokenCookie(req) {
    const cookies = this._parseCookies(req);
    return cookies[TOKEN_NAME];
  }

  setTokenCookie(res, token) {
    const expires = this._getTokenExpires(token);

    const cookie = serialize(TOKEN_NAME, token, {
      expires: expires,
      httpOnly: false,
      secure: false,
      path: '/',
      sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', cookie);
  }

  removeTokenCookie(res) {
    const cookie = serialize(TOKEN_NAME, '', {
      maxAge: -1,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
  }

  _parseCookies(req) {
    // For API Routes we don't need to parse the cookies.
    if (req.cookies) return req.cookies;

    // For pages we do need to parse the cookies.
    const cookie = req.headers.cookie;
    return parse(cookie || '');
  }

  _getTokenExpires(token) {
    throw new Error('_getTokenExpires should be implemented in child');
  }
}

class Auth extends AuthBase {
  constructor() {
    super();
  }

  static getInstance() {
    if (!Auth.__instance) {
      Auth.__instance = new Auth();
    }
    return Auth.__instance;
  }

  authenticate(platform, req, res, next) {
    passport.authenticate(platform, (error, user, info) => {
      try {
        if (error) {
          return res.status(error?.status || 500).send(error.message);
        }
        return res.send(`
            <script>
              window.opener.postMessage({ type: 'auth-success', user: ${JSON.stringify(user)} }, '${process.env.CLIENT_HOST}');
              window.close();
            </script>
            `);
      } catch (error) {
        return res.status(error?.status || 500).send(error.message);
      }
    })(req, res, next);
  }

  scopesMapper(platform) {
    const platformScopesMap = {
      google: { scope: [SOCIAL_AUTH.PROFILE, SOCIAL_AUTH.EMAIL] },
      facebook: {
        public_actions: [
          SOCIAL_AUTH.PUBLIC_PROFILE,
          SOCIAL_AUTH.EMAIL,
          SOCIAL_AUTH.USER_PHOTOS,
        ]
      },
      youtube: { scope: [SOCIAL_AUTH.SCOPE_YOUTUBE, SOCIAL_AUTH.PROFILE, SOCIAL_AUTH.EMAIL] },
      reddit: { scope: [SOCIAL_AUTH.IDENTITY, SOCIAL_AUTH.READ] },
      linkedin: { scope: [SOCIAL_AUTH.OPENID, SOCIAL_AUTH.PROFILE, SOCIAL_AUTH.EMAIL, SOCIAL_AUTH.W_MEMBER_SOCIAL] },
      discord: { scope: [SOCIAL_AUTH.IDENTIFY, SOCIAL_AUTH.EMAIL] },
      twitter: { scope: [SOCIAL_AUTH.USERS_READ] },
      snapchat: { scope: [SOCIAL_AUTH.USER_DISPLAY_NAME, SOCIAL_AUTH.USER_BITMOJI_AVATAR, SOCIAL_AUTH.USER_EXTERNAL_ID] },
    };
    return platformScopesMap[platform] || [];
  }

  getScopes(platform) {
    return auth.scopesMapper(platform)
  }

  getStrategy(platform) {
    let strategy = platform;
    switch (platform) {
      case SOCIAL_AUTH.YOUTUBE:
        strategy = SOCIAL_AUTH.GOOGLE;
        break;
    }
    return strategy;
  }

  getCallbackUrl(platform) {
    let url = `${process.env.HOST}/api/auth/social/callback`
    let query = `?platform=${platform}`;

    switch (platform) {
      case SOCIAL_AUTH.YOUTUBE:
        query = `?platform=${SOCIAL_AUTH.GOOGLE}`;
        break;
      case SOCIAL_AUTH.TWITTER:
        url = `${process.env.HOST}/api/auth/twitter/callback`;
        query = '';
        break;
    }
    return `${url}${query}`;
  }
}

// issuer === email
// const token = '{"issuer":"test@user.com"}';
class TestAuth extends AuthBase {
  isTokenValid(token) {
    try {
      JSON.parse(token);
      return true;
    } catch (err) {
      return false;
    }
  }

  getIssuer(token) {
    const tokenObj = JSON.parse(token);
    return tokenObj.issuer;
  }

  async getMetadata(issuer) {
    return { email: issuer };
  }

  _getTokenExpires(token) {
    const expiresDif = 1000 * 60 * 60; // 60 min
    const now = new Date();
    const expires = new Date(now.getTime() + expiresDif);
    return expires;
  }

  static getInstance() {
    if (!TestAuth.__instance) {
      TestAuth.__instance = new TestAuth();
    }
    return TestAuth.__instance;
  }
}

const isCI = process.env.IS_CI === 'true';
const auth = isCI ? TestAuth.getInstance() : Auth.getInstance();

module.exports = {
  auth,
};
