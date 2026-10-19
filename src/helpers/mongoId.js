/**
 * Safe MongoDB ObjectId helpers
 */

const { ObjectId } = require('mongodb');

/**
 * Convert a value to ObjectId, or null if invalid
 * @param {unknown} id
 * @returns {import('mongodb').ObjectId|null}
 */
function toObjectId(id) {
  if (!id) return null;
  try {
    if (id instanceof ObjectId) return id;
    const str = String(id).trim();
    if (!ObjectId.isValid(str) || str.length !== 24) return null;
    return new ObjectId(str);
  } catch {
    return null;
  }
}

/**
 * Build an ownership filter that matches user_id stored as ObjectId or string
 * @param {string|import('mongodb').ObjectId} userId
 * @returns {{ $or: object[] }|object}
 */
function userIdFilter(userId) {
  const oid = toObjectId(userId);
  const asString = userId != null ? String(userId) : null;
  const or = [];
  if (oid) or.push({ user_id: oid });
  if (asString) or.push({ user_id: asString });
  if (or.length === 0) return { user_id: '__invalid__' };
  if (or.length === 1) return or[0];
  return { $or: or };
}

module.exports = {
  toObjectId,
  userIdFilter,
};
