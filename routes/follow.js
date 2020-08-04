const express = require("express");
const auth = require("../middleware/auth");
const { follow } = require("../controller/follow");

const router = express.Router();

router.route("/").post(auth, follow);

module.exports = router;
