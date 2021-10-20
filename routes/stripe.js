const express = require('express');

const {
  createConnectAccount,
  getAccountStatus,
  getAccountBalance,
  getPayoutSettings,
} = require('../controllers/stripe');
const { protect } = require('../controllers/auth');

const router = express.Router();

router.post('/create-connect-account', protect, createConnectAccount);
router.post('/get-account-status', protect, getAccountStatus);
router.post('/get-account-balance', protect, getAccountBalance);
router.post('/payout-settings', protect, getPayoutSettings);

module.exports = router;
