const express = require('express');
const { createChat, userChats, findChat } = require('../controllers/ChatControllers.js');
const { authUser } = require('../middleware/auth');

const router = express.Router();


router.post('/',authUser,createChat);
router.get('/:userId',authUser, userChats);
router.get('/find/:firstId/:secondId',authUser,findChat);

module.exports = router;