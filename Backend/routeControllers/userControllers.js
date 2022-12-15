const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcrypt");

// Register a new User
const registerUser = asyncHandler(async (req, res) => {
	try {
		const { name, email, password, pic } = req.body;

		if (!name || !email || !password) {
			res.status(400);
			throw new Error("Please Enter all the fields");
		}

		const userExists = await User.findOne({ email });

		if (userExists) {
			res.status(400);
			throw new Error("User already exists");
		}
		
		// Hashing password
		bcrypt.hash(password, 10, (err, hash) => {
			if (err) {
				res.status(400);
				console.log(err);
			} else {
				const newUser = new User({
					email,
					name,
					password: hash,
					pic,
				});

				newUser.save().then((user) => {
					res.status(200).json({
						success: true,
						_id: user._id,
						name: user.name,
						email: user.email,
						pic: user.pic,
						token: generateToken(user._id),
					});
				});
			}
		});
	} catch (err) {
		console.log(err);
	}
});

// Authorize user 
const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		res.status(400);
		throw new Error("Please Enter all the fields");
	}

	User.findOne({ email }, (err, foundUser) => {
		if (err) {
			res.status(400).json(err);
		} else {
			if (foundUser) {
				bcrypt.compare(password, foundUser.password, (err, result) => {
					if (result == true) {
						res.status(200).json({
							success: true,
							_id: foundUser._id,
							name: foundUser.name,
							email: foundUser.email,
							pic: foundUser.pic,
							token: generateToken(foundUser._id),
						});
					} else {
						res.json({ success: false, err });
					}
				});
			}
		}
	});
});

// Search users
const allUsers = asyncHandler(async (req, res) => {
	const keyword = req.query.search
		? {
				$or: [
					{ name: { $regex: req.query.search, $options: "i" } },
					{ email: { $regex: req.query.search, $options: "i" } },
				],
		  }
		: {};

    // Find user(s) using the keyword 
	const users = await User.find(keyword).find({
		_id: { $ne: req.user._id },
	});
	res.send(users);
});

module.exports = { registerUser, authUser, allUsers };