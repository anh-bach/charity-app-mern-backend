const express = require('express');

const {
  getDonationsByCampaign,
  getDonationsByUser,
} = require('../controllers/donation');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

//user routes
router.get('/get-donations-by-campaign/:slug', protect, getDonationsByCampaign);
router.get('/get-donations-by-user/:userId', protect, getDonationsByUser);

//admin routes

module.exports = router;
