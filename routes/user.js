const express = require("express");
const { signupUser } = require("../controller/user");

const router = express.Router();

router.route("/user").post(signupUser);

module.exports = router;
