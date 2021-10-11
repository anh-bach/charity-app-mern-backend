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

//Protect all routes after this middleware
router.use(protect);

//restrict all routes to only admin after this middleware
router.use(restrictTo('admin'));

//Admin route
//get categories
router.get('/admin/categories', list);
router.get('/admin/category/:slug', read);
//create + update + delete category
router.post('/admin/category', create);
router.patch('/admin/category/:slug', update);
router.delete('/admin/category/:slug', remove);

module.exports = router;
