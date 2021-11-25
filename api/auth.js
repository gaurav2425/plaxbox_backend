const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config");
//@route api/users
//@desc Auth route
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
  }
});

//@route api/auth
//@desc Authenticate User
//@access Public

router.post(
  "/",
  [
    check("email", "Must Include Valid Email").isEmail(),
    check("password", "Password is Required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);

    const { email, password } = req.body;

    try {
      //See if User exists
      let user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });

          // res.json({ email, password });
        }
      );

      //   res.send(user);
    } catch (err) {
      console.log(err.message);
    }
  }
);

module.exports = router;
