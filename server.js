require("dotenv").config("../.env");
const express = require("express");
var cors = require("cors");
const connectToDB = require("./config/db");
const bodyParser = require("body-parser");
// const path = require("path");
require("./models/user");
require("./models/chat");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Connects to Database
connectToDB();

const app = express();
app.use(cors());
app.use(express.json()); // To accept json data
app.use(bodyParser.urlencoded({ extended: true }));

// Routes for login and signup
app.use("/api/user", userRoutes);

// Chat Routes
app.use("/api/chat", chatRoutes);

// Message Routes
app.use("/api/message", messageRoutes);

// --------------Deployment --------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname1, "/frontend/build")));

// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
// 	});
// } else {
// 	app.get("/", (req, res) => {
// 		res.send("API is not running successfully");
// 	});
// }

// --------------Deployment --------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	console.log("Server is running");
});

// Socket io for real time messaging

const io = require("socket.io")(server, {
	pingTimeout: 60000,
	cors: {
		origin: "http://localhost:3000",
	},
});

// connect to socket
io.on("connection", (socket) => {
	console.log("connected to socket.io");

	socket.on("setup", (userData) => {
		socket.join(userData._id);
		socket.emit("connected");
	});

	// when user join the room
	socket.on("join chat", (room) => {
		socket.join(room);
		console.log("User Joined Room: " + room);
	});

	// user is typing
	socket.on("typing", (room) => socket.in(room).emit("typing"));

	// user stopped typing
	socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

	// New message in UI
	socket.on("new message", (newMessageReceived) => {
		let chat = newMessageReceived.chat;

		if (!chat.users) return console.log("chat.users not defined");
		chat.users.forEach((user) => {
			if (user._id == newMessageReceived.sender._id) return;
			socket.in(user._id).emit("message received", newMessageReceived);
		});
	});

	socket.off("setup", () => {
		console.log("USER DISCONNECTED");
		socket.leave(userData._id);
	});
});
