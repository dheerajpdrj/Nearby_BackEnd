const express = require ("express");
const router = express.Router();
const { authUser } = require('../middleware/auth');
const {createPost, getAllPost, comment}= require('../controllers/post')


router.post('/createPost', authUser , createPost);
router.get('/getAllPosts', authUser,getAllPost);
router.put("/comment",authUser, comment);

module.exports = router; 