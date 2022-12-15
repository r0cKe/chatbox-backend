const express = require("express");
const { protect } = require("../middlewares/authMiddleWare");
const {
	registerUser,
	authUser,
	allUsers,
} = require("../routeControllers/userControllers");

const router = express.Router();

// Registering user and Getting users
router.route("/").get(protect, allUsers).post(registerUser);

// Login user
router.post("/login", authUser);

module.exports = router;
