const express = require("express");
const Profile = require("../models/Profile");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { username } = req.body;
    const myprofile = await Profile.find({ username: username });

    // console.log(myprofile);
    // res.json(myprofile);
    if (myprofile.length >= 1) {
      res.json("Username already Taken");
    } else {
      res.json("Username Not Found");
    }
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

module.exports = router;
