const {
  profileDal,
} = require('../dal/index');
const { CustomError } = require('../helpers/customError');
const { UnprocessableEntity } = require('../helpers/errors');
const emailService = require('../helpers/email');
const { getHashPasswordAndSalt } = require('../helpers/auth/user');

const getProfileInfo = async (profileId) => {
  const profile = await profileDal.getOne(profileId, { isSuper: true });
  let username = profile.email;
  if (profile.username) {
    username = profile.username;
  }
  return { username };
};

const createProfile = async (data) => {
  if (data.password) {
    const { password, salt } = await getHashPasswordAndSalt(data.password);
    data.password = password;
    data.salt = salt;
  }
  const { email: emailStr = '', ...rest } = data;
  const email = emailStr.toLowerCase();
  let profile = await profileDal.getOneByEmail(email);
  if (profile) {
    throw new CustomError('User already exists', 409);
  }
  profile = await profileDal.create(
    {
      ...rest,
      email,
    }
  );
  return profile;
};

const registerProfile = async (data) => {
  const { email: emailStr = '', ...rest } = data;
  const email = emailStr.toLowerCase();
  if (!email) {
    throw new UnprocessableEntity('Email not defined');
  }
  let profile = await profileDal.getOneByEmail(email);
  if (profile && profile.email === email) {
    return profile;
  }
  await emailService.sendUserRegisterEmail({
    email,
    itemLinkText: `${process.env.HOST}`,
    itemLinkUrl: `${process.env.HOST}?e=${encodeURIComponent(email)}`,
  });
  profile = await profileDal.create(
    {
      ...rest,
      sub: `${new Date().getTime()}`,
      issuer: `${new Date().getTime()}`,
      email,
      isFirstLogin: true,
      roles: [],
    },
    { isSuper: true },
  );
  return profile;
};

// Module pattern to create a singleton instance of the service functions
const ProfileService = (() => {
  return {
    create: createProfile,
    register: registerProfile,
  };
})();

module.exports = {
  profileService: ProfileService,
  getProfileInfo,
};
