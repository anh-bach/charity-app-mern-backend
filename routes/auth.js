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

//User routes
//Update password
router.patch('/updateMyPassword', protect, updatePassword);
//Update current user data
router.patch('/updateMe', protect, updateMe);
//Get current user data
router.get('/me', protect, getMe, getOneUser);
//Delete current user account
router.delete('/deleteMe', protect, deleteMe);

//Admin routes
router
  .route('/users')
  .get(protect, restrictTo('admin'), getAllUsers)
  .post(protect, restrictTo('admin'), createUser);
router
  .route('/users/:id')
  .get(protect, restrictTo('admin'), getOneUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
