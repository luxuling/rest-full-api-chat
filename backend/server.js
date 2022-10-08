const express = require("express")
const dotenv = require("dotenv")
const getMongo = require("./config/db")
const { yellow } = require("colors")

const { Server } = require("socket.io");
const { createServer } = require("http");


const app = express()
const httpServer = createServer(app);

dotenv.config()
getMongo()

app.use(express.json())
const userRouter = require("./routes/userRouter")
const chatRouter = require("./routes/chatRouter")
const messageRouter  =require("./routes/messageRouter")
const PORT = process.env.PORT || 5000


// const io = require("socket.io")(http, {
//   pingTimeout: 60000,
//   cors: {
//     origin: ["https://awok-talking.netlify.app"],
//   },
// });

const io = new Server(httpServer, {
  cors: {
    origin: ["https://awok-talking.netlify.app"]
  }
});


app.get("/", (req, res) => {
  res.send("API is running")
})
app.use("/api/user",userRouter)
app.use("/api/chat", chatRouter)
app.use("/api/message",messageRouter)

httpServer.listen(PORT, function () {
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
})

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