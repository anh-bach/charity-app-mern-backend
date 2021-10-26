const express = require('express');

const { getDonationsByCampaign } = require('../controllers/donation');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

//user routes
router.get('/get-donations-by-campaign/:slug', protect, getDonationsByCampaign);

//admin routes

module.exports = router;
