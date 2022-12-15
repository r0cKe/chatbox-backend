const asyncHandler = require("express-async-handler");
const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");

// Send a new message
const sendMessage = asyncHandler(async (req, res) => {
	const { content, chatId } = req.body;

	if ((!content, !chatId)) {
		console.log("Invalid datassed into request.");
		return res.sendStatus(400);
	}

	let newMessage = {
		sender: req.user._id,
		content,
		chat: chatId,
	};

	try {
		let message = await Message.create(newMessage);

		message = await message.populate("sender", "name pic");
		message = await message.populate("chat");
		message = await User.populate(message, {
			path: "chat.users",
			select: "name pic email",
		});

		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		});

		res.json(message);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

// Show all messages
const allMessages = asyncHandler(async (req, res) => {
	try {
		const message = await Message.find({ chat: req.params.chatId })
			.populate("sender", "name pic email")
			.populate("chat");

		res.json(message);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

module.exports = { sendMessage, allMessages };