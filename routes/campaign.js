const express = require('express');

const {
  getCampaigns,
  createCampaign,
  getCampaignsByUser,
  getCampaignByUser,
  getCampaignsByAdmin,
  approveCampaignByAdmin,
  countApprovedCampaigns,
  getCampaign,
} = require('../controllers/campaign');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

//public routes
router.get('/campaigns', getCampaigns);
router.get('/count-active-campaigns', countApprovedCampaigns);
router.get('/campaign/:slug', getCampaign);

//user routes
router.post('/create-campaign', protect, createCampaign);
router.get('/get-campaign-by-user/:slug', protect, getCampaignByUser);
router.get('/get-campaigns-by-user', protect, getCampaignsByUser);

//admin routes
router.get(
  '/admin/campaigns',
  protect,
  restrictTo('admin'),
  getCampaignsByAdmin
);
router.post(
  '/admin/campaign/approve/:campaignId',
  protect,
  restrictTo('admin'),
  approveCampaignByAdmin
);

module.exports = router;
