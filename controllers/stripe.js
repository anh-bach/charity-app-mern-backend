const queryString = require('query-string');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

exports.createConnectAccount = catchAsync(async (req, res) => {
  //get user
  const user = await User.findById(req.user._id);
  //create a stripe_account_id if user don't have it yet
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({ type: 'express' });
    user.stripe_account_id = account.id;
    await User.findByIdAndUpdate(req.user._id, {
      stripe_account_id: account.id,
    });
  }

  //create a login link based on stripe_account_id for front-end to complete on-boarding
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: 'account_onboarding',
  });

  //prefill any info such as email
  accountLink = Object.assign(accountLink, {
    'stripe_user[email]': user.email || undefined,
  });

  const link = `${accountLink.url}?${queryString.stringify(accountLink)}`;

  res.status(200).json({
    status: 'success',
    data: link,
  });
}, 'From create connect stripe');

const updateDelayDays = async (accountId) => {
  try {
    const account = await stripe.accounts.update(accountId, {
      settings: {
        payouts: {
          schedule: {
            delay_days: 10,
          },
        },
      },
    });
    return account;
  } catch (error) {
    console.log('From update delay days', error);
  }
};

exports.getAccountStatus = catchAsync(async (req, res) => {
  //make request to stripe and get account status
  const user = await User.findById(req.user._id);
  const account = await stripe.accounts.retrieve(user.stripe_account_id);
  //update delayDays from 7 by default to 10 days
  const updatedAccount = await updateDelayDays(account.id);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      stripe_seller: updatedAccount,
    },
    { new: true }
  ).select('-password');
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
}, 'From account status stripe');

exports.getAccountBalance = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const balance = await stripe.balance.retrieve({
    stripeAccount: user.stripe_account_id,
  });
  res.status(200).json({
    status: 'success',
    data: balance,
  });
}, 'From account balance stripe');

exports.getPayoutSettings = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const loginLink = await stripe.accounts.createLoginLink(
    user.stripe_account_id,
    {
      redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
    }
  );

  console.log(loginLink);
  res.status(200).json({
    status: 'success',
    data: loginLink,
  });
}, 'From payout setting stripe');
