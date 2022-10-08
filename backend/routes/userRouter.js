const express = require("express")
const {registerHandler,loginHandler,allUsers} = require("../controller/userControlers")
const { protect } = require("../middleware/authUser")
const router = express.Router()

router.route("/").get(protect, allUsers);
router.route("/").post(registerHandler);
router.post("/login", loginHandler);

module.exports = router