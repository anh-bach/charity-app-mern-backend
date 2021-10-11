const Category = require('../models/category');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    throw new AppError('Category name is required!');
  }
  const category = await Category.create({ name });
  res.json({
    status: 'success',
    data: { category },
  });
}, 'From create category--->');

exports.list = catchAsync(async (req, res, next) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });
  res.json({
    status: 'success',
    data: { categories },
  });
}, 'From list all categories--->');

exports.read = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new AppError('No category found!', 401);
  }
  res.json({
    status: 'success',
    data: { category },
  });
}, 'From read category--->');

exports.update = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { slug } = req.params;

  const category = await Category.findOne({ slug });
  category.name = name;
  await category.save();
  res.json({
    status: 'success',
    data: { category },
  });
}, 'From create category--->');

exports.remove = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const deleted = await Category.findOneAndDelete({ slug });
  if (!deleted) {
    throw new AppError('No such category found! Please try again later!');
  }
  res.json({ status: 'success', message: 'Category deleted!' });
}, 'From create category--->');
