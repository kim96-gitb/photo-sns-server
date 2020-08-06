const express = require("express");
const {
  myposting,
  update_photo,
  delete_photo,
  followPosting,
  photoPosting,
} = require("../controller/posting");
const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, photoPosting);
router.route("/me").get(auth, myposting);
router.route("/update").put(auth, update_photo);
router.route("/delete").delete(auth, delete_photo);
router.route("/followposting").get(auth, followPosting);

module.exports = router;
