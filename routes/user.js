const express = require("express");
const { signupUser, loginUser } = require("../controller/user");

const router = express.Router();

router.route("/").post(signupUser);
router.route("/login").post(loginUser);

module.exports = router;
