const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

//Helper function to filter unwanted property
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

//I))) Get all users controller
exports.getAllUsers = catchAsync(async (req, res, next) => {
  //filter
  let filters = {};
  //create and chain the query
  const features = new APIFeatures(User.find(filters), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //execute the query
  const docs = await features.query;
  //send response
  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: { docs },
  });
}, 'From getAll user controller');

//II))) Get a User controller
exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}, 'From get one user controller--->');

//III))) Update user controller
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}, 'From update user controller--->');

//IV))) Delete a user controller
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with this id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
}, 'Delete a user controller--->');

//V))) Create a user controller
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /register instead',
  });
};

//VI))) get the current user controller ->set user id to req params then use getOneUser controller
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//VII))) Delete Me controller
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: null,
  });
}, 'From delete me controller--->');

//VIII))) Update Me Controller
exports.updateMe = catchAsync(async (req, res, next) => {
  //1)))) Check if there is password or passwordConfirm in req.body
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400
      )
    );
  }
  //2)))) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');
  //3)))) Update user
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}, 'From Update Me Controller--->');
