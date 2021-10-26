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
