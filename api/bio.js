const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

const auth = require("../middleware/auth");

router.post("/updatebio", auth, async (req, res) => {
  try {
    const { bio } = req.body;

    const myprofile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      {
        bio: bio,
      }
    );
    // console.log(myprofile);
    res.json(myprofile);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

module.exports = router;
