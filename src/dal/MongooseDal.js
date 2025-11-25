const mongoose = require("mongoose");
const { BaseDal } = require("./BaseDal");
const {
  NotFound,
  Unauthorized,
  UnprocessableEntity,
} = require("../helpers/errors");
const { CustomError } = require("../helpers/customError");
const { generateKey } = require("../helpers/keyGenerator");

const simpleKeys = [
  "isFinalized",
  "isFiled",
  "applied",
  "test",
  "tags",
  "type",
  "query",
  "$custom",
];

class MongooseDal extends BaseDal {
  constructor(Model, options = {}) {
    const { search } = options;
    super();
    this.Model = Model;
    this.search = search;
  }

  async getList(query, user) {
    const { filter, range, sort } = query;

    let filterRule = {};
    await this._beforeFilter(filterRule, user, query);
    // filterRule = await this._applyFilters(filterRule, filter);

    let skip = 0;
    let limit = undefined;
    if (range) {
      skip = range[0];
      limit = range[1] - range[0] + 1;
    }

    let sortRule = undefined;
    if (sort) {
      sortRule = { [sort[0]]: sort[0].toLowerCase() };
    }

    const [newSkip, newLimit] = await this._beforeSkipLimit(
      skip,
      limit,
      filter,
      user
    );

    const defaultProjection = undefined;
    const projection = await this._beforeListProjection(
      defaultProjection,
      filter,
      user
    );
    await this._beforeFindQuery(filterRule, user);
   
    const aggs = await this._getListAggregation(
      false,
      user,
      filter,
      newSkip,
      newLimit,
      sort,
      projection,
      query
    );
    let list = [];
    if (aggs) {
      list = await this.Model.aggregate(aggs);
    } else {
      list = await this.Model.find(filter, projection)
        .skip(newSkip)
        .limit(newLimit)
        .sort(sortRule)
        .select();
      list = list.map((item) => item.toJSON());
    }
    return list;
  }

  async getOne(id, user) {

    const query = { _id: id };

    // await this._beforeFilter(query, user);
    const doc = await this.Model.findOne(query);
    if (!doc) {
      throw new NotFound();
    }
    return doc.toJSON();
  }

  async getOneByOrderId(id) {
    const query = { orderId: id };
    const doc = await this.Model.findOne(query);
    if (!doc) {
      throw new NotFound();
    }
    return doc.toJSON();
  }

  async getCount(query, user) {
    const { filter } = query;
    let filterRule = {};
    await this._beforeFilter(filterRule, user, query);
    filterRule = await this._applyFilters(filterRule, filter);
    await this._beforeFindQuery(filterRule, user);
    const aggs = await this._getListAggregation(true, user, filterRule);
    let count = 0;
    if (aggs) {
      const list = await this.Model.aggregate(aggs);
      count = list[0] ? list[0].count : 0;
    } else {
      count = await this.Model.find(filterRule).count();
    }
    return count;
  }

  async update(id, data, user) {
    // if (!user) {
    //   throw new Unauthorized();
    // }
    const query = { _id: id };

    await this._beforeUpdate(data);
    delete data.updatedAt;
    const old = await this.Model.findOneAndUpdate(query, data);
    const doc = await this.Model.findOne(query);

    const obj = doc.toJSON();
    await this._afterUpdate(old.toJSON(), obj, data, user);
    return obj;
  }

  async create(data, hasKey=true) {
    if(hasKey) {
      await this._beforeCreate(data);
    }
    delete data.updatedAt;
    delete data.updatedAt;
    
    const doc = new this.Model(data);
    await doc.save();
    const obj = doc.toJSON();
    return obj;
  }

  async delete(id, user) {
    // if (!user) {
    //   throw new Unauthorized();
    // }
    const query = { _id: id };
    await this._beforeFilter(query, user);
    const doc = await this.Model.findOne(query);
    await this._beforeDelete(doc);
    let obj;
    if (doc) {
      obj = doc.toJSON();
      await doc.deleteOne();
      await this._afterDelete(obj, user);
    }
    return obj;
  }

  async _beforeListProjection(projection, filter, user) {
    return projection;
  }

  async _beforeFindQuery(query, user) { }

  async _getListAggregation(
    isCount = false,
    user,
    filterRule,
    skip,
    limit,
    sort,
    projection,
    query
  ) {
    return undefined;
  }

  async _beforeSkipLimit(skip, limit, filter, user) {
    return [skip, limit];
  }

  _isIgnoredFilterKey(key) {
    if (key === "$custom" || key === "tags") {
      return true;
    }
    return false;
  }

  async _beforeFilter(query, user, initQuery) { }

  async _applyFilters(filterRule = {}, filter) {
    if (filter) {
      Object.keys(filter).forEach((key) => {
        const value = filter[key];
        if (key === "id") {
          if (Array.isArray(value)) {
            filterRule._id = {
              $in: value
                .filter((i) => i)
                .map((str) => (str || "").trim())
                .map((str) => new mongoose.Types.ObjectId(str)),
            };
          } else {
            filterRule._id = new mongoose.Types.ObjectId(value.trim());
          }
        } else if (this._isIgnoredFilterKey(key)) {
          // do nothing
        } else if (simpleKeys.indexOf(key) !== -1) {
          filterRule[key] = value;
        } else {
          if (Array.isArray(value)) {
            filterRule[key] = {
              $in: value
                .filter((i) => i)
                .map((str) => (str || "").trim())
                .map((str) => new mongoose.Types.ObjectId(str)),
            };
          } else {
            filterRule[key] = new mongoose.Types.ObjectId(value.trim());
          }
        }
      });
    }
    return filterRule;
  }

  async deleteBunch(ids = [], user) {
    // if (!user) {
    //   throw new Unauthorized();
    // }
    if (!ids || !ids.length) {
      return [];
    }

    const removed = await Promise.all(
      ids.map(async (id) => {
        try {
          await this.delete(id, user);
          return id;
        } catch (e) {
          return undefined;
        }
      })
    );

    return removed.filter((i) => i);
  }

  async updateInternal(id, updates) {
    const query = { _id: new mongoose.Types.ObjectId(id) };
    await this._beforeFilter(query, { isSuper: true });
    const doc = await this.Model.findOne(query);
    if (!doc) {
      return {};
    }
    await this.Model.updateOne(query, { $set: updates });
    return this.getOne(id, { isSuper: true });
  }

  async searchReindex() {
    return 0;
  }
  async _getSearchIndex(obj) {
    return null;
  }

  async _beforeCreate(obj) {
    const title = obj.username || obj.email;
    const key = await generateKey(this.Model, title);
    obj.key = key;
  }

  async _afterCreate(obj, data, user) {
    // const searchData = await this._getSearchIndex(obj);
    // if (searchData) {
    //   this.search.save(searchData.id, searchData).catch((err) => {
    //     this.logger.error(`Search save error: ${err.message}`);
    //   });
    // }
  }

  async _beforeUpdate(obj) {
    if (!obj.key && typeof obj.key !== "undefined") {
      const title = obj.title || obj.name || obj.username || obj.email;
      const key = await generateKey(this.Model, title);
      obj.key = key;
    }
  }

  async _afterUpdate(fromObj, toObj, data, user) {
    // const searchData = await this._getSearchIndex(toObj);
    // if (searchData) {
    //   this.search.save(searchData.id, searchData).catch((err) => {
    //     this.logger.error(`Search save error: ${err.message}`);
    //   });
    // }
  }

  async _beforeDelete(doc, refKey, refCollections) {
    for (const collection of refCollections) {
      let count = await mongoose.model(collection).countDocuments({
        [refKey]: { $in: [doc._id] },
      });
      if (count > 0) {
        throw new CustomError(`Document is referenced in ${collection}.`, 409);
      }
      409;
    }
  }
}

module.exports = {
  MongooseDal,
};
