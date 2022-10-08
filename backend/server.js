const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const getMongo = require("./config/db")
const { yellow } = require("colors")
const app = express()
app.use(express.json())
const userRouter = require("./routes/userRouter")
const chatRouter = require("./routes/chatRouter")
const messageRouter  =require("./routes/messageRouter")
const PORT = process.env.PORT || 5000

dotenv.config()
getMongo()
app.use(cors())
app.get("/", (req, res) => {
  res.send("API is running")
})
app.use("/api/user",userRouter)
app.use("/api/chat", chatRouter)
app.use("/api/message",messageRouter)

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://awok-talking.netlify.app/');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing",(room)=> socket.in(room).emit("typing"))
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))
  

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});