const express = require("express");
const { photoPosting } = require("../controller/posting");
const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, photoPosting);

module.exports = router;
