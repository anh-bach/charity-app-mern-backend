const Campaign = require('../models/campaign');
const Donation = require('../models/donation');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//public controller
exports.getCampaigns = catchAsync(async (req, res) => {
  //filter
  let filters = { status: 'approved' };
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
}, 'From get approved campaigns by public');

exports.countApprovedCampaigns = catchAsync(async (req, res) => {
  const activeCampaignsTotal = await Campaign.countDocuments({
    status: 'approved',
  });
  res.status(200).json({
    status: 'success',
    data: {
      activeCampaignsTotal,
    },
  });
}, 'From count approved campaigns');

exports.getCampaign = catchAsync(async (req, res) => {
  const campaign = await Campaign.findOne({
    status: 'approved',
    slug: req.params.slug,
  })
    .populate('category', 'name')
    .populate('createdBy', 'photo name address');
  res.status(200).json({
    status: 'success',
    data: {
      campaign,
    },
  });
}, 'From get campaign by status approved and slug');

//User controller
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
    slogan,
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
    slogan,
  }).save();
  res.status(201).json({
    status: 'success',
    data: campaign,
  });
}, 'From create campaign controller');

exports.updateCampaignByUser = catchAsync(async (req, res) => {
  console.log(req.body);
  const {
    title,
    description,
    target,
    imageCover,
    from,
    to,
    location,
    category,
    slogan,
  } = req.body;

  const campaign = await Campaign.findOne({ slug: req.params.slug });

  if (!campaign) {
    throw new AppError('There is no such campaign', 404);
  }
  campaign.title = title;
  campaign.description = description;
  campaign.target = target;
  campaign.imageCover = imageCover;
  campaign.from = from;
  campaign.to = to;
  campaign.location = location;
  campaign.category = category;
  campaign.slogan = slogan;
  campaign.status = 'pending';
  await campaign.save();
  res.status(201).json({
    status: 'success',
    data: campaign,
  });
}, 'From update campaign by user');

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

exports.getTotalActiveCampaignsByUser = catchAsync(async (req, res) => {
  const activeCampaignsTotalByUser = await Campaign.countDocuments({
    createdBy: req.params.userId,
    status: 'approved',
  });
  res.status(200).json({
    status: 'success',
    data: {
      activeCampaignsTotalByUser,
    },
  });
}, 'From get campaigns by user');

exports.getCampaignByUser = catchAsync(async (req, res) => {
  const campaign = await Campaign.findOne({
    createdBy: req.user._id,
    slug: req.params.slug,
  })
    .populate('category', 'name')
    .populate('createdBy', 'photo name address');
  res.status(200).json({
    status: 'success',
    data: campaign,
  });
}, 'From get campaigns by user');

exports.makeDonation = catchAsync(async (req, res) => {
  const { amount, name, address, city, country, phone } = req.body;

  const campaign = await Campaign.findOne({ slug: req.params.slug });

  if (!campaign) {
    throw new AppError('No such campaign found', 404);
  }

  //update the campaign donatedAmount
  campaign.donatedAmount += amount;
  await campaign.save();

  const donation = await new Donation({
    donatedBy: req.user,
    donatedTo: campaign._id,
    amount,
    billInfo: {
      payer: name,
      address,
      city,
      country,
      phone,
    },
  });

  await donation.save();

  res.status(200).json({
    status: 'success',
  });
}, 'From make donation');

//Admin controller
exports.getCampaignsByAdmin = catchAsync(async (req, res) => {
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
}, 'From get campaigns by admin');

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
