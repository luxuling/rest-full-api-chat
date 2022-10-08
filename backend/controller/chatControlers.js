const asyncHandler = require("express-async-handler")
const Chat = require("../models/chatModel")
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChat = asyncHandler(async(req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({updatedAt:-1})
      .then(async (result) => {
      result = await User.populate(result, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
        res.status(200).send(result)
    })
  } catch (error) {
    throw new Error(error)
  }
})

const crateGroup = asyncHandler(async (req, res)=> {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({message:"please fill the form"})
  }

  let users = JSON.parse(req.body.users)

  if (users < 2) {
    return res.status(400).send("please add more than 2 account")
  }

  users.push(req.user)
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user
    })

    const fullGroup = await Chat.findOne({_id: groupChat._id})
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    res.status(200).json(fullGroup)


  } catch (err) {
    throw new Error(err)
  }
})

const renameGroup = asyncHandler(async (req,res) => {
  const { chatId, chatName } = req.body
  const updateChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    }, {
      new: true
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
  
  if (!updateChat) {
    res.status(400)
    throw new Error("Chat error")
  } else {
    res.json(updateChat)
  }
})  

const addUserGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body
  
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push:{users:userId},
    }, {
      new: true
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
  
  if (!added) {
    res.status(400)
    throw new Error("Chat error")
  } else {
    res.json(added)
  }
})

const removeUserGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body
  
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull:{users:userId}
    }, {
      new: true
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
  
  if (!removed) {
    res.status(400)
    throw new Error("Chat error")
  } else {
    res.json(removed)
  }
})
module.exports = { accessChat, fetchChat ,crateGroup ,renameGroup, addUserGroup,removeUserGroup}