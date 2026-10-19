/**
 * @typedef RestApiQuery
 * @property {string[]} sort -
 * @property {string} sort.0 - field name
 * @property {string} sort.1 - order (DESC, ASC)
 * @property {number[]} range -
 * @property {number} range.0 - range start
 * @property {number} range.1 - range end
 * @property {Object} filter -
 */

/**
 * @typedef RestApiUser
 * @property {ObjectId} id -
 * @property {Array{string}} roles -
 */

/**
 * @typedef RestApiListResponse
 * @property {Array<any>} data -
 * @property {number} [total] -
 */

class BaseDal {
  /**
   *
   * @param {RestApiQuery} query -
   * @param {RestApiUser} user -
   * @returns {number}
   */
  async getCount(query, user) {}

  /**
   *
   * @param {RestApiQuery} query -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async getList(query, user) {
    return [];
  }

  /**
   *
   * @param {string} id -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async getOne(id, user) {
    return {};
  }

  /**
   *
   * @param {Array<string>} ids -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async getMany(ids, user) {
    return [];
  }

  /**
   *
   * @param {RestApiQuery} query -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async getManyReference(query, user) {
    return [];
  }

  /**
   *
   * @param {string} id -
   * @param {Object} data -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async update(id, data, user) {
    return {};
  }

  /**
   *
   * @param {Object} data -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async create(data, user) {
    return {};
  }

  /**
   *
   * @param {string} id -
   * @param {RestApiUser} user -
   * @returns {RestApiListResponse}
   */
  async delete(id, user) {
    return {};
  }
}

module.exports = {
  BaseDal,
};
