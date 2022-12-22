const express = require('express');
const router = express.Router();
const {uploadImages , listImages} = require('../controllers/upload');
const { authUser } = require('../middleware/auth');
const imageUpload = require('../middleware/imageUpload');


router.post('/uploadImages', authUser , imageUpload, uploadImages);
router.post('/listImages',authUser , listImages)

module.exports = router;