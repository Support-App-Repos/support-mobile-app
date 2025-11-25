const { User } = require('../models/User');
const { UserMongooseDal } = require('./UserMongooseDal');

const userDal = new UserMongooseDal(User);

module.exports = {
  userDal,
};