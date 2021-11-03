const Donation = require('../models/donation');
const Campaign = require('../models/campaign');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getDonationsByCampaign = catchAsync(async (req, res) => {
  const campaign = await Campaign.findOne({ slug: req.params.slug });

  if (!campaign) {
    throw new AppError('No such campaign found', 404);
  }

  //filter
  let filters = { donatedTo: campaign._id };
  //create and chain the query
  const features = new APIFeatures(
    Donation.find(filters).populate('donatedBy', 'name photo'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //execute the query
  const donations = await features.query;

  res.status(200).json({
    status: 'success',
    data: donations,
  });
}, 'From get donations by campaign');

exports.getDonationsByUser = catchAsync(async (req, res) => {
  const filters = { donatedBy: req.params.userId };

  const features = new APIFeatures(
    Donation.find(filters).populate({
      path: 'donatedTo',
      select: 'title slug createdBy',
      populate: { path: 'createdBy', select: 'name' },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //execute the query
  const donations = await features.query;

  res.status(200).json({
    status: 'success',
    data: donations,
  });
}, 'From get donations by user');

exports.getDonationsToUser = catchAsync(async (req, res) => {
  const donations = await Donation.find({}).populate('donatedTo', 'createdBy');

  const donationsToUser = donations.filter((donation) =>
    donation.donatedTo.createdBy.equals(req.user._id)
  );

  res.status(200).json({
    status: 'success',
    data: donationsToUser,
  });
}, 'From get donations to user');

exports.getDonationsByDayForAdmin = catchAsync(async (req, res) => {
  const past_x_days = 30 * 86400000; // where 86400000 is millis per day (24*60*60*1000)

  const donations = await Donation.aggregate([
    {
      $match: {
        $expr: {
          $gt: [
            { $toDate: '$_id' },
            { $toDate: { $subtract: [new Date(Date.now()), past_x_days] } },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          dateYMD: {
            $dateFromParts: {
              year: { $year: '$_id' },
              month: { $month: '$_id' },
              day: { $dayOfMonth: '$_id' },
            },
          },
        },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.dateYMD': -1 },
    },
    {
      $project: {
        _id: 0,
        count: '$totalAmount',
        dateDMY: {
          $dateToString: { date: '$_id.dateYMD', format: '%d-%m-%Y' },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: donations,
  });
}, 'From get donations by day for admin');

exports.getCampaignsByDayForAdmin = catchAsync(async (req, res) => {
  const past_x_days = 30 * 86400000; // where 86400000 is millis per day (24*60*60*1000)

  const campaigns = await Campaign.aggregate([
    {
      $match: {
        $expr: {
          $gt: [
            { $toDate: '$_id' },
            { $toDate: { $subtract: [new Date(Date.now()), past_x_days] } },
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          dateYMD: {
            $dateFromParts: {
              year: { $year: '$_id' },
              month: { $month: '$_id' },
              day: { $dayOfMonth: '$_id' },
            },
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.dateYMD': -1 },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        dateDMY: {
          $dateToString: { date: '$_id.dateYMD', format: '%d-%m-%Y' },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: campaigns,
  });
}, 'From get campaigns by day for admin');
