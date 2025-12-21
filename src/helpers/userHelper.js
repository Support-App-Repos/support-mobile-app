/**
 * User Helper
 * Utility functions for extracting user information from request
 */

/**
 * Extract user ID from request
 * Handles both Mongoose (old) and Prisma (new) user structures
 */
function getUserId(req) {
  // Try Prisma user first (from addReqUser middleware)
  if (req.user?.id) {
    return req.user.id;
  }

  // Try userPayload.sub (JWT token structure)
  if (req.userPayload?.sub) {
    const user = req.userPayload.sub;
    // Mongoose uses _id, Prisma uses id
    return user.id || user._id || user._id?.toString();
  }

  // Try direct userPayload.id
  if (req.userPayload?.id) {
    return req.userPayload.id;
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


