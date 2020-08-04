const express = require("express");
const { signupUser } = require("../controller/user");

const router = express.Router();

router.route("/").post(signupUser);

module.exports = router;
