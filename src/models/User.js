const mongoose = require('mongoose');

const userRole = {
  ADMIN: 'admins',
  APPROVER: 'approvers',
  LAWYER: 'lawyers',
};

const isAdmin = (user) => {
  if (!user) {
    return false;
  }
  if (user.isSuper) {
    return true;
  }
  return (user.roles || []).indexOf(userRole.ADMIN) !== -1;
};

const userSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    displayName: {
      type: String,
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    userType: {
      type: String,
    },
    location: {
      type: String,
    },
    roles: [
      {
        type: String,
      },
    ],
    picture:
    {
      data: { type: Buffer, contentType: String },
      title: String,
      contentType: String,
    },
    imageUrl: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.set('toJSON', {
  virtuals: true,
});

const User = mongoose.model('User', userSchema);

module.exports = {
  userSchema,
  User,
  userRole,
};
