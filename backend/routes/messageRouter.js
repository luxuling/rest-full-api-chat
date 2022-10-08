const express = require("express")
const { sendMessage, allMessage } = require("../controller/messageController")
const { protect } = require("../middleware/authUser")

const router = express.Router()

router.route("/").post(protect,sendMessage)
router.route("/:chatId").get(protect,allMessage)

module.exports = router