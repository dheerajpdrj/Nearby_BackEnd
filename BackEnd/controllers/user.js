const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/userModel");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/token");
const { sendVerificationEmail } = require("../helpers/mailer");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

exports.register = async (req, res) => {


  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;


    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "invalid email address",
      });
    }
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message:
          "This email address already exists,try with a different email address",
      });
    }
    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "first name must between 3 and 30 characters.",
      });
    }
    if (!validateLength(last_name, 1, 30)) {
      return res.status(400).json({
        message: "last name must between 3 and 30 characters.",
      });
    }
    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: "password must be atleast 6 characters.",
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);


    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);
    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );


    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    // sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register Success ! please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.activateAccount = async (req, res) => {

  try {
    const validUser = req.user.id;

    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);

    let check = await User.findById(user.id);

    if (validUser !== user.id) {
      return res.status(400).json({ message: "You dont have the authorization to complete this operation" });
    }

    if (check.verified == true) {
      return res.status(400).json({ message: "This email is already activated" })
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true })
      return res.status(200).json({ message: "Account has been activated successfully" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('following')
    if (!user) {
      return res.status(400).json({
        message:
          "the email address you entered is not connected to an account.",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials.Please try again.",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      following: user.following,
      token: token,
      verified: user.verified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}

exports.sendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res.status(400).json({ message: "This account is already activated" })
    }

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    res.status(200).json({ message: "Email verification link has been sent to your email" })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findById(req.user.id);
    const profile = await User.findOne({ username }).select('-password');

    const friendship = {
      following: false
    }

    if (!profile) {
      return res.json({ ok: false });
    }

    if (user.following.includes(profile._id)) {
      friendship.following = true;
    };

    const post = await Post.find({ user: profile._id }).populate('user').populate("comments.commentBy","first_name last_name picture username commentAt").sort({ createdAt: -1 });


    await (await profile.populate("following", "first_name last_name username picture")).populate("followers", "first_name last_name username picture");

    res.json({ ...profile.toObject(), post, friendship })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    const response = await User.findByIdAndUpdate(req.user.id, {
      picture: url
    })
    res.json(url);

  } catch (error) {
    res.status(500).json({ message: error.message })

  }
}


exports.follow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);


      if (!sender.following.includes(receiver._id) &&
        !receiver.followers.includes(sender._id)
      ) {
        await receiver.updateOne({
          $push: { followers: sender._id }
        });
        await sender.updateOne({
          $push: { following: receiver._id }
        });
        const tempUser = await User.findById(req.user.id).populate("following")
        const following = tempUser.following;
        res.json(following)
      } else {
        return res.status(400).json({ message: "Already following" })
      }
    } else {
      return res.status(400).json({ message: "You cant follow yourself" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message })

  }
}

exports.unFollow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);

      if (sender.following.includes(receiver._id) &&
        receiver.followers.includes(sender._id)
      ) {
        await receiver.updateOne({
          $pull: { followers: sender._id }
        });
        await sender.updateOne({
          $pull: { following: receiver._id }
        });
        const tempUser = await User.findById(req.user.id).populate("following")
        const following = tempUser.following;
        res.json(following)
      } else {
        return res.status(400).json({ message: "Already following" })
      }
    } else {
      return res.status(400).json({ message: "You cant follow yourself" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message })

  }
}

exports.search = async (req,res)=>{
  const {q} = req.query;
  console.log(q);

  try {  
    const users = await User.find({first_name:{$regex:`(?i)${q}`}}).select("first_name last_name username picture");
    console.log(users)
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({message:error.message})
  }
  
};


exports.getFriendsPageInfos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("following followers")
      .populate("following", "first_name last_name picture username")
      .populate("followers", "first_name last_name picture username");
    res.json({
      following: user.following,
      followers: user.followers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
