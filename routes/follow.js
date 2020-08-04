const express = require("express");
const auth = require("../middleware/auth");
const { follow, unfollow } = require("../controller/follow");

const router = express.Router();

router.route("/").post(auth, follow);
router.route("/un").delete(auth, unfollow);

module.exports = router;
