const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your name.'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'A user must have an email address.'],
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: Object,
    },
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    address: { type: String },
    phone: { type: String },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be longer than 6 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Password does not match.',
      },
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpire: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    stripe_account_id: '',
    stripe_seller: {},
    stripeSession: {},
  },
  {
    timestamps: true,
  }
);

//1))))hashing password when user register for the first time or when user update password
userSchema.pre('save', async function (next) {
  //only hashing password if the password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //delete password confirm
    this.passwordConfirm = undefined;

    next();
  } catch (error) {
    console.log(`Bcrypt hashing password error -->`, error);
  }
});

//2)))) Update the passwordChangedAt property if it happens
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//3))))instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.log(`Bcrypt compare password error--->`, error);
  }
};

//4))))instance method to check if the user changes the password after issuing the reset password token
userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp; // true if user changes the password
  }

  //false if user does not change password
  return false;
};

//5)))) instance method to create a reset password token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//Making a model from Schema
const User = mongoose.model('User', userSchema);

//export the user model
module.exports = User;
