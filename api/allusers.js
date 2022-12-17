const express = require("express");
const router = express.Router();
const User = require("../models/User");

//@route api/users
//@desc Auth route
//@access Public
router.get("/", async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
