const express = require('express');

const { upload, remove } = require('../controllers/cloudinary');
const { protect } = require('../controllers/auth');

const router = express.Router();

//protect routes after this middlewares
router.use(protect);

router.post('/upload-images', upload);
router.post('/remove-image', remove);

module.exports = router;
