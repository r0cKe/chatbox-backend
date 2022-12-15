const express = require("express");
const { protect } = require("../middlewares/authMiddleWare");
const {accessChats, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup} = require('../routeControllers/chatControllers');

const router = express.Router();

// Post request to access chat when user clicks
router.route("/").post(protect, accessChats);

// Get request to fetch chats
router.route("/").get(protect, fetchChats);

// Post request to create a group chat
router.route("/group").post(protect, createGroupChat);

// Put request to Rename group
router.route("/rename").put(protect, renameGroup);

// Put request to add users to group
router.route("/groupadd").put(protect, addToGroup);

// Put request to remove user from group
router.route("/groupremove").put(protect, removeFromGroup);

module.exports = router;
