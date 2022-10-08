const express = require("express")
const { accessChat,fetchChat, crateGroup, renameGroup, addUserGroup, removeUserGroup } = require("../controller/chatControlers")
const { protect } = require("../middleware/authUser")

const router = express.Router()

router.route("/").post(protect, accessChat)
router.route("/").get(protect, fetchChat)
router.route("/group").post(protect, crateGroup)
router.route("/rename").put(protect, renameGroup)
router.route("/addusergroup").put(protect, addUserGroup)
router.route("/removeusergroup").put(protect, removeUserGroup)

module.exports = router