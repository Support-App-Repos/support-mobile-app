const { User } = require('../models/User');
const { UserMongooseDal } = require('./UserMongooseDal');

const userDal = new UserMongooseDal(User);
// Alias for backward compatibility
const profileDal = userDal;

module.exports = {
  userDal,
  profileDal,
};