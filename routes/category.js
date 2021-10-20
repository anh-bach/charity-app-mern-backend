const express = require('express');
const { protect, restrictTo } = require('../controllers/auth');
const {
  list,
  read,
  create,
  update,
  remove,
} = require('../controllers/category');

const router = express.Router();

//User route
//get categories
router.get('/admin/categories', protect, list);
router.get('/admin/category/:slug', protect, read);
//Admin route
//create + update + delete category
router.post('/admin/category', protect, restrictTo('admin'), create);
router.patch('/admin/category/:slug', protect, restrictTo('admin'), update);
router.delete('/admin/category/:slug', protect, restrictTo('admin'), remove);

module.exports = router;
