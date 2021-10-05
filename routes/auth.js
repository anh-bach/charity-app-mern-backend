const express = require('express');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} = require('../controllers/auth');
const {
  getAllUsers,
  createUser,
  getOneUser,
  updateUser,
  deleteUser,
  getMe,
  deleteMe,
  updateMe,
} = require('../controllers/user');

const router = express.Router();

//signup route
router.post('/register', register);
//signin route
router.post('/login', login);
//forgot password
router.post('/forgotPassword', forgotPassword);
//reset password
router.patch('/resetPassword/:token', resetPassword);
//logout route
router.get('/logout', logout);

//Protect all routes after this middleware
router.use(protect);

//Update password
router.patch('/updateMyPassword', updatePassword);
//Update current user data
router.patch('/updateMe', updateMe);
//Get current user data
router.get('/me', getMe, getOneUser);
//Delete current user account
router.delete('/deleteMe', deleteMe);

//restrict all routes to only admin after this middleware
router.use(restrictTo('admin'));
router.route('/users').get(getAllUsers).post(createUser);
router.route('/users/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
