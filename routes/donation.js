const express = require('express');

const {
  getDonationsByCampaign,
  getDonationsByUser,
  getDonationsToUser,
  getDonationsByDayForAdmin,
  getCampaignsByDayForAdmin,
} = require('../controllers/donation');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

//user routes
router.get('/get-donations-by-campaign/:slug', protect, getDonationsByCampaign);
router.get('/get-donations-by-user/:userId', protect, getDonationsByUser);
router.get('/get-donations-to-user', protect, getDonationsToUser);

//admin routes
router.get(
  '/get-donations-by-day-for-admin',
  protect,
  restrictTo('admin'),
  getDonationsByDayForAdmin
);

router.get(
  '/get-campaigns-by-day-for-admin',
  protect,
  restrictTo('admin'),
  getCampaignsByDayForAdmin
);

module.exports = router;
