const express = require('express');
const router = express.Router();
const {register, activateAccount, login, sendVerification,getUser, getProfile, updateProfilePicture, follow, unFollow, search, getFriendsPageInfos, } = require('../controllers/user');
const { authUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/activate',authUser, activateAccount);
router.post('/login',login);
router.get("/getUser/:id", authUser, getUser);
router.post('/sendVerification',authUser,sendVerification);
router.get('/getProfile/:username',authUser, getProfile);
router.put('/updateProfilePicture',authUser, updateProfilePicture);
router.put('/follow/:id',authUser, follow);
router.put('/unFollow/:id',authUser, unFollow);
router.get('/search', authUser,search);
router.get("/getFriendsPageInfos", authUser, getFriendsPageInfos);

module.exports=router;