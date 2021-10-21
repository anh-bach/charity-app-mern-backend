const express = require('express');

const {
  createCampaign,
  getCampaignsByUser,
  getCampaigns,
  approveCampaignByAdmin,
} = require('../controllers/campaign');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

//user routes
router.post('/create-campaign', protect, createCampaign);
router.get('/get-campaigns-by-user', protect, getCampaignsByUser);

//admin routes
router.get('/admin/campaigns', protect, restrictTo('admin'), getCampaigns);
router.post(
  '/admin/campaign/approve/:campaignId',
  protect,
  restrictTo('admin'),
  approveCampaignByAdmin
);

module.exports = router;
