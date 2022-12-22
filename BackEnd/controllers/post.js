const { findByIdAndUpdate } = require('../models/Post');
const Post = require('../models/Post')

exports.createPost = async (req, res) => {
    try {
        const post = await new Post(req.body).save();
        await post.populate("user", "first_name last_name cover picture username");
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllPost = async (req, res) => {
    try {
        const allpost = await Post.find()
            .populate('user', 'first_name last_name picture username gender')
            .populate("comments.commentBy", "first_name last_name picture username commentAt").sort({ createdAt: -1 });

        res.status(200).json(allpost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.comment = async (req, res) => {
    try {
        const { comment, postId } = req.body;
        const newComment = await Post.findByIdAndUpdate(postId, {
            $push:
            {
                comments: {
                    comment: comment,
                    commentBy: req.user.id,
                    commentAt: new Date(),
                }

            }
        },
            {
                new: true,
            }).populate("comments.commentBy", 'picture first_name last_name username').sort({ createdAt:-1 })
        res.json(newComment.comments);
    } catch (error) {
        res.json({ message: error.message })
    }
}