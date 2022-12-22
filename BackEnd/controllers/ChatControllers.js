const ChatModel = require("../models/ChatModel")

exports.createChat = async (req, res) => {

    const check = await ChatModel.findOne({
        members: { $all: [req.body.senderId, req.body.receiverId] }
    });

    if (!check) {
        const newChat = new ChatModel({
            members: [req.body.senderId, req.body.receiverId]
        })
        try {
            const result = await newChat.save()
            res.status(200).json("ok");

        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }else{
        res.json('ok');
    }

}

exports.userChats = async (req, res) => {
    try {
        const Chat = await ChatModel.find({
            members: { $in: [req.params.userId] }
        })
        res.status(200).json(Chat);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.findChat = async (req, res) => {
    try {
        const chat = await ChatModel.findOne({
            members: { $all: [req.params.firstId, req.params.secondId] }
        })
        res.status(200).json(chat)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
} 