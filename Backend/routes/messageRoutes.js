const express = require("express");
const { protect } = require("../middlewares/authMiddleWare");
const {sendMessage, allMessages} = require('../routeControllers/messageControllers');

const router = express.Router();

// Post request to send message
router.route('/').post(protect, sendMessage);

// Get request to access messages of a chat using chatId
router.route('/:chatId').get(protect, allMessages);


module.exports = router;