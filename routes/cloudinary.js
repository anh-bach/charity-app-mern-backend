const express = require('express');

const { upload, remove } = require('../controllers/cloudinary');
const { protect } = require('../controllers/auth');

const router = express.Router();

//user routes

router.post('/upload-images', protect, upload);
router.post('/remove-image', protect, remove);

module.exports = router;
