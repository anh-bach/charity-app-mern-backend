const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/user');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

//Helper function to create token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Helper function to create and send token back to the user as cookie
const createSendToken = (user, statusCode, req, res, rememberMe = true) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: 0,
    httpOnly: true, //unable to manipulate the cookie from client side
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'none',
  };

  if ((process.env.NODE_ENV = 'production')) cookieOptions.secure = true;

  //remember Me
  if (rememberMe) {
    cookieOptions.expires = new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    );
  }

  //save the token in browser cookie, named jwt
  res.cookie('jwt', token, cookieOptions);

  //remove password from response
  user.password = undefined;

  //sending response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

//I))) Register Handler
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;

  //if user exists
  let user = await User.findOne({ email });

  if (user) {
    throw new AppError('This email already exists!', 401);
  }

  user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });

  //Sending welcome email

  const url = `${req.get('origin')}/me`;
  await new Email(user, url).sendWelcome();

  //create a JWT - keep the new user logged in
  createSendToken(user, 201, req, res);
}, 'From register controller--->');

//II))) Login Handler
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, remember } = req.body;

  //1)))) check if email or password provided - verbose
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  //2)))) Check if user exists and password correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  //3)))) if everything is ok, send login token to client
  createSendToken(user, 200, req, res, remember);
}, 'From Login controller--->');

//III))) Logout controller
exports.logout = (req, res, next) => {
  // clear the cookie
  res.clearCookie('jwt', { path: '/' });
  res.status(200).json({ status: 'success' });
};

//IV))) Middleware to protect route -> only grant access to logged in users
exports.protect = catchAsync(async (req, res, next) => {
  //1)))) Get the token and whether its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //if token is in the req headers
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    //if token is in cookies
    token = req.cookies.jwt;
  }

  if (!token || token === 'null' || token === null) {
    throw new AppError(
      'You are not logged in. Please login to get access',
      401
    );
  }

  //2)))) Verificate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)))) check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError('The user belongs to this token does no longer exist', 401)
    );
  }

  //4)))) check if the user changes password after the token is issued
  if (user.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again.', 401)
    );
  }

  //5)))) Grant access to the user
  req.user = user;
  res.locals.user = user;
  next();
}, 'From protect middleware--->');

//V))) Grant access to specific route to specific user
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to access this route.', 403)
      );
    }

    next();
  };
};

//VI))) Forgot password controller
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)))) Get the user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError('There is no user with this email address.', 404);
  }

  //2))) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3))) Send the reset token to user email
  try {
    const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message:
        'Please check your email and follow instructions to reset your password.',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the email. Please try again later',
      500
    );
  }
}, 'From forgot password controller--->');

//VII))) Reset password controller
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)))) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2)))) If the token is not expired and there is such user, reset the password
  if (!user) {
    throw new AppError(
      'Your reset token is invalid or expired. Please request new email!',
      400
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3))) Update changedPasswordAt property for the user
  // changedPasswordAt property is updated by the pre('save') in the user model schema
  //4))) Log the user in, send the token
  createSendToken(user, 200, req, res);
}, 'From reset password controller--->');

//VIII))) Update password controller
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)))) Get user
  const user = await User.findById(req.user.id).select('+password');
  //2)))) Check if password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3)))) If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4)))) Log user in, send JWT
  createSendToken(user, 200, req, res);
}, 'From update password controller');
