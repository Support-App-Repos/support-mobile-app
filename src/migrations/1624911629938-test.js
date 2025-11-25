const { mongoose, loadEnv } = require('./common');

module.exports.up = function (next) {
  loadEnv()
    .then(() => {
      next();
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

module.exports.down = function (next) {
  next();
};
