/**
 * User Helper
 * Utility functions for extracting user information from request
 */

/**
 * Normalize an id value to string
 */
function normalizeId(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toString === 'function') return value.toString();
  return null;
}

/**
 * Extract user ID from request
 * Prefer JWT payload (auth user) over legacy mongoose profile — profileDal can
 * resolve a different User collection/document for the same email.
 */
function getUserId(req) {
  // JWT token structure from generateToken({ id, email, ... })
  if (req.userPayload?.sub) {
    const user = req.userPayload.sub;
    const fromJwt = normalizeId(user.id || user._id);
    if (fromJwt) return fromJwt;
  }

  if (req.userPayload?.id) {
    const fromPayload = normalizeId(req.userPayload.id);
    if (fromPayload) return fromPayload;
  }

  // Legacy / profile middleware fallback
  if (req.user?.id) {
    return normalizeId(req.user.id);
  }

  return null;
}

/**
 * Get full user object from request
 */
function getUser(req) {
  return req.user || req.userPayload?.sub || req.userPayload || null;
}

module.exports = {
  getUserId,
  getUser,
};


