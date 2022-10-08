const asyncHandler = require("express-async-handler")
const generateToken = require("../config/createToken")
const User = require("../models/userModel")

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
  res.send(users);
});

const registerHandler = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body
  
  const emailDuplicaate = await User.findOne({ email })
  if (emailDuplicaate) {
    res.status(400)
    res.send("Your email alredy exist!!")
    return
  }
  const user = await User.create({
    name,
    email,
    password,
    pic
  })
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id)
    })
  } else {
    res.status(400)
    res.send("Failed to create account")
    return
  }
})

const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPasswd(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    res.send("Invalid Email or Password");
  }
})


module.exports = { registerHandler, loginHandler,allUsers }