const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const auth = require("../middleware/auth");
const Profile = require("../models/Profile");
//@route api/profile/me
//@desc Get Current user profile
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
    console.log("Profile Found");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

//@route api/profile/me
//@desc Get Create or update user profile
//@access Private

router.post(
  "/",
  auth,
  [
    // check("name", "Name is required").not().isEmpty(),
    // check("username", "username is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, username, bio } = req.body;
    profileFields = { name, username, bio };
    profileFields.user = req.user.id;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
    }
  }
);

router.get("/myprofileinfo", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    // if (!profile) {
    //   return res.status(400).json({ msg: "There is no profile for this user" });
    // }
    res.json(profile);
    console.log("Profile Found");
    console.log(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:profileId", auth, async (req, res) => {
  try {
    const User1 = await Profile.find({
      // members: { $in: [req.params.userId] },
      _id: req.params.profileId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    });
    res.status(200).json(User1);
    // const user = await User.findById(req.user.id).select("-password");
    // res.json(user);
    console.log(User1);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

module.exports = router;

// profileFields = {};
//     if (name) {
//       profileFields.name = name;
//     }
//     if (username) {
//       profileFields.username = username;
//     }
