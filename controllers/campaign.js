const Campaign = require('../models/campaign');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.createCampaign = catchAsync(async (req, res) => {
  const {
    title,
    description,
    target,
    imageCover,
    from,
    to,
    location,
    category,
  } = req.body;

  const campaign = await new Campaign({
    title,
    description,
    target,
    imageCover,
    from,
    to,
    location,
    category,
    createdBy: req.user,
  }).save();
  res.status(201).json({
    status: 'success',
    data: campaign,
  });
}, 'From create campaign controller');

exports.getCampaignsByUser = catchAsync(async (req, res) => {
  const campaigns = await Campaign.find({ createdBy: req.user._id }).populate(
    'category',
    'name'
  );
  res.status(200).json({
    status: 'success',
    data: campaigns,
  });
}, 'From get campaigns by user');

exports.getCampaigns = catchAsync(async (req, res) => {
  //filter
  let filters = {};
  //create and chain the query
  const features = new APIFeatures(
    Campaign.find(filters)
      .populate('createdBy', 'name')
      .populate('category', 'name'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //execute the query
  const campaigns = await features.query;
  //send response
  res.status(200).json({
    status: 'success',
    results: campaigns.length,
    data: { campaigns },
  });
}, 'From get campaigns by user');

exports.approveCampaignByAdmin = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const campaign = await Campaign.findById(campaignId);
  campaign.status = req.body.status;
  campaign.save();

  res.status(200).json({
    status: 'success',
    message: `The campaign is ${req.body.status}`,
  });
}, 'From update campaign by admin');
