const Message = require("../models/MessageModel");


exports.addMessage = async (req, res) => {
    try {
        const { chatId, senderId, text } = req.body;
        console.log(text);
        const newMessage = new Message({
            chatId, senderId, text
        })

        const result = await newMessage.save();
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId;  ;
        const messages = await Message.find({ chatId });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}