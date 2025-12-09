const mongoose = require('mongoose');
const { isAdmin, isApprover } = require('../models/User');
const { MongooseDal } = require('./MongooseDal');
const { NotFound, Unauthorized } = require('../helpers/errors');
const {
  activityItem,
  activityAction,
  voteType,
  rewardResource,
  MODALS,
  COMMON,
} = require('../consts');

class UserMongooseDal extends MongooseDal {
  async _getListAggregation(
    isCount = false,
    user,
    filterRule,
    skip,
    limit,
    sort,
    projection,
    query,
  ) {

    const baseProjection = {
      id: '$_id',
      key: 1,
      title: 1,
      email: 1,
      imageUrl: 1,
      password: 1,
      username: 1,
      firstName: 1,
      lastName: 1,
      displayName: 1,
      phone: 1,
      description: 1,
      location: 1,
      experience: 1,
      lawyerServices: 1,
      lawyerType: 1,
      userType: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const finalProjection = projection || baseProjection;

    const aggs = [
      {
        $project: {
          ...baseProjection,
        },
      },
      { $match: filterRule },
      {
        $project: {
          ...finalProjection,
        },
      },
    ];
    if (isCount) {
      aggs.push({ $count: 'count' });
    } else {
      const hasCustomQuery = query && query.filter && query.filter.$custom;
      if (hasCustomQuery && query.filter.$custom.userType) {
        aggs.push({
          $match: {
            userType: { $regex: query.filter.$custom.userType, $options: 'i' },
          },
        });
      }

      if (sort) {
        const sortRule = {
          [sort[0]]: sort[0].toLowerCase() === 'asc' ? 1 : -1,
        };
        aggs.push({ $sort: sortRule });
      }
      if (typeof skip === 'number') {
        aggs.push({ $skip: skip });
      }
      if (typeof limit === 'number') {
        aggs.push({ $limit: limit });
      }
    }
    return aggs;
  }

  async getList(query, user) {
    const res = await super.getList(query);
    return res;
  }

  async getOne(id, user) {
    
    const res = await super.getOne(id, user);
    if (!res) {
      throw new NotFound();
    }
    const list = [res];
    return list[0];
  }

  async getOneByKey(key, user) {
    let res = undefined;
    try {
      // id fallback
      res = await super.getOne(key, user);
    } catch (err) { }
    if (!res) {
      res = await super.getOneByKey(key, user);
    }
    if (!res) {
      throw new NotFound();
    }
    const list = [res];
    await this._fillOwners(list);
    await this._fillTags(list);
    return list[0];
  }

  async getOneByEmail(email) {
    const doc = await this.Model.findOne({ email });
    if (doc) {
      const obj = doc.toJSON();
      return obj;
    }
  }

  async getOneByTitle(title) {
    const doc = await this.Model.findOne({ title });
    if (doc) {
      const obj = doc.toJSON();
      return obj;
    }
  }

  _isIgnoredFilterKey(key) {
    return false;
  }

  async _getSearchIndex(obj) {
    const res = {
      id: obj.id.toString(),
      key: obj.key,
      type: 'problems',
      title: obj.title,
      teaser: '',
      body: obj.body,
      owner: '',
      ownerId: '',
      tags: '',
      isPublic: obj.isPublic === undefined ? true : obj.isPublic,
      isFinalized: true,
      isPaid: true,
    };
    if (obj.owner) {
      const User = mongoose.model('User');
      const owner = await User.findOne({ _id: obj.owner });
      res.owner = owner.username;
      res.ownerId = obj.owner.toString();
    }
    if (obj.tags && obj.tags.length) {
      const Tag = mongoose.model('Tag');
      const tags = await Tag.find({ _id: obj.tags });
      let tagsStr = '';
      (tags || []).forEach((tag) => {
        tagsStr += tag.name + ' ';
      });
      res.tags = tagsStr.trim();
    }
    return res;
  }

  async _beforeDelete(doc) {
    return;
  }

  async _beforeSkipLimit(skip, limit, filter, user) {
    if (filter && filter.$custom && filter.$custom.type === 'unlimit') {
      return [0, 500];
    }
    return [skip, limit];
  }

  async _beforeListProjection(projection, filter, user) {
    if (
      filter &&
      filter.$custom
    ) {
      return undefined;
    }
    return super._beforeListProjection(projection, filter, user);
  }

  async _beforeFilter(query, user) {
   
  }

  async _beforeFindQuery(query, user) {
    if (query.$custom) {
      delete query.$custom;
    }
  }

  async _beforeCreate(obj, user) {
    return super._beforeCreate(obj, user);
  }

  async _afterCreate(obj, data, user) {
    await super._afterCreate(obj, data, user);
  }

  async _beforeUpdate(obj, user) {
    delete obj.owner;
    return super._beforeUpdate(obj, user);
  }

  async _afterUpdate(fromObj, toObj, data, user) {
    // update application tags
    await super._afterUpdate(fromObj, toObj, data, user);
  }

  async _afterDelete(obj, user) {
    // check Solution
    const Solution = mongoose.model('Solution');
    await Solution.deleteMany({ problem: obj.id });
    const Application = mongoose.model('Application');
    const apps = await Application.find({ problem: obj.id });
    // check Application
    await Application.deleteMany({ problem: obj.id });
    await this._updateApplication(obj);
    // check parent
    if (obj.parentProblem) {
      // update problem subProblems, remove
      const Problem = mongoose.model('Problem');
      await Problem.updateOne(
        { _id: obj.parentProblem },
        { $pull: { subProblems: obj.id } },
      );
    }
    if (obj.subProblems && obj.subProblems.length) {
      // update problems parentProblem, reset
      const Problem = mongoose.model('Problem');
      await Problem.updateMany(
        { _id: { $in: obj.subProblems } },
        { $unset: { parentProblem: '' } },
      );
    }
    // clear activity
    const Activity = mongoose.model('Activity');
    await Activity.deleteMany({
      itemId: obj.id,
      itemType: activityItem.PROBLEM,
    });
    // clear rewards
    const Reward = mongoose.model('Reward');
    await Reward.deleteMany({
      itemId: obj.id,
      resource: rewardResource.PROBLEM,
    });
    await super._afterDelete(obj, user);
  }

  async _updateApplication(obj) {
    const Application = mongoose.model('Application');
    const application = await Application.findOne({ selected: obj.id });
    if (application) {
      const selected = application.selected || [];
      selected.push(application.problem);
      const Problem = mongoose.model('Problem');
      const Solution = mongoose.model('Solution');
      const problems = await Problem.find(
        { _id: { $in: selected } },
        { tags: 1 },
      );
      const solutions = await Solution.find(
        { _id: { $in: selected } },
        { tags: 1 },
      );
      const tagsList = [];
      [...problems, ...solutions].map((item) => {
        (item.tags || []).forEach((i) => tagsList.push(i.toString()));
      });
      const tags = [...new Set(tagsList)];
      await Application.updateOne(
        { _id: application._id },
        { tags: tags.map((i) => new mongoose.Types.ObjectId(i)) },
      );
    }
  }
}

module.exports = {
  UserMongooseDal,
};
