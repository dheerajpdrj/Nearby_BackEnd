
const Reacts = require("../models/Reacts");
const mongoose = require("mongoose");

exports.reactPost = async (req, res) => {
    try {
        const { postId, react } = req.body;
        const check = await Reacts.findOne({
            postRef: postId,
            reactBy: mongoose.Types.ObjectId(req.user.id)
        })

        if (check == null) {
            const newReact = new Reacts({
                react: react,
                postRef: postId,
                reactBy: req.user.id
            })
            await newReact.save();
        } else {
            if (check.react == react) {
                await Reacts.findByIdAndRemove(check._id)
            } else {
                await Reacts.findByIdAndUpdate(check._id,
                    { react: react })
            }
        }
        res.json("ok");
    } catch (error) {
        res.json({ message: error.message })
    }
}


exports.getReacts = async (req, res) => {
    try {
        const id = req.params.id;
        const reactsArray = await Reacts.find({ postRef: id });

        const newReacts = reactsArray.reduce((group, react)=>{
            const key = react["react"];
            group[key] = group[key] || [];
            group[key].push(react);
            return group;
        },{});

        const reacts = [
            {
                react : "like",
                count : newReacts.like ? newReacts.like.length : 0,
            },
            {
                react : "love",
                count : newReacts.love ? newReacts.love.length : 0,
            },
            {
                react : "haha",
                count : newReacts.haha ? newReacts.haha.length : 0,
            },
            {
                react : "sad",
                count : newReacts.sad ? newReacts.sad.length : 0,
            },
            {
                react : "wow",
                count : newReacts.wow ? newReacts.wow.length : 0,
            },
            {
                react : "angry",
                count : newReacts.angry ? newReacts.angry.length : 0,
            },
        ]
         
        const check = await Reacts.findOne({
            postRef: id,
            reactBy: req.user.id,
        })

        res.json({
            reacts,
           check: check?.react,
           total: reactsArray.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
