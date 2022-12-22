const express = require('express');

const router = express.Router();
const {addMessage, getMessages} = require('../controllers/MessageController.js');
const { authUser } = require('../middleware/auth.js');

router.post('/', authUser, addMessage);
router.get("/:chatId", authUser, getMessages)


module.exports = router;