const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userModel = mongoose.Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique:true},
    password: { type: String, required: true },
    pic: {type: String, default:"https://divedigital.id/wp-content/uploads/2021/10/1-min.png"}
  },
  {
    timestamps: true,
  }
)
userModel.methods.matchPasswd = async function(insertPasswd) {
  return await bcrypt.compare(insertPasswd, this.password)
}

userModel.pre("save", async function (next){
  if (!this.isModified) {
    next()
  }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})
const User = mongoose.model("User", userModel)
module.exports = User