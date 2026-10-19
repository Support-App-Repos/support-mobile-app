const crypto = require("crypto");

async function getHashPasswordAndSalt(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const password = crypto
    .pbkdf2Sync(plainPassword, salt, 1000, 64, "sha512")
    .toString("hex");

  return {password, salt};
}

function validatePassword(user, inputPassword) {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, user.salt, 1000, 64, "sha512")
    .toString("hex");
  return user.password === inputHash;;
}

module.exports = {
  getHashPasswordAndSalt,
  validatePassword,
};
