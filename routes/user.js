const express = require("express");
const auth = require("../middleware/auth");
const { signupUser, loginUser, logoutUser } = require("../controller/user");

const router = express.Router();

router.route("/").post(signupUser);
router.route("/login").post(loginUser);
router.route("/logout").delete(auth, logoutUser);

module.exports = router;
