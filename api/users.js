const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const config = require("config");
const auth = require("../middleware/auth");
const router = express.Router();
const Profile = require("../models/Profile");
const { update } = require("../models/User");
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const ChatRoom = require("../models/ChatRoom");

//@route api/users
//@desc Register User
//@access Public

router.post(
  "/",
  [
    check("name", "Must Include Name").not().isEmpty(),
    check("email", "Must Include Valid Email").isEmail(),
    check("username", "Please Enter Valid Username").not().isEmpty(),
    check("password", "Must password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);

    const { name, email, password, username, bio } = req.body;

    try {
      //See if User exists
      let user = await User.findOne({ email });
      let usernameunik = await User.findOne({ username });
      console.log(usernameunik);
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already Exist" }] });
      }

      if (usernameunik) {
        res.status(400).json({ errors: [{ msg: "Username already Exist" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        password,
        username,
        avatar,
      });

      // profile = new Profile({
      //   name,
      //   username,
      // });

      // const { name, username, bio } = req.body;
      // profileFields = { name, username, bio };

      // profile = new Profile(profileFields);

      // await profile.save();

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      // await profile.save();

      // const userid = user.id;
      // profile = new Profile({
      //   userid,
      //   name,
      //   email,
      //   username,
      //   avatar,
      // });

      // await profile.save();

      profileFields = { name, username, bio };
      profileFields.user = user.id;

      profile = new Profile(profileFields);
      await profile.save();

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

router.get("/", (req, res) => {
  User.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

router.get("/:userId", auth, async (req, res) => {
  try {
    const User1 = await User.find({
      // members: { $in: [req.params.userId] },
      _id: req.params.userId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    }).select();
    res.status(200).json(User1);
    // const user = await User.findById(req.user.id).select("-password");
    // res.json(user);
    console.log(User1);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

router.get("/request/myrequests", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user.Pendingfriends);
    console.log(user.Pendingfriends);

    //   var url =
    // "mongodb+srv://admin:gaurav2184@cluster0.9mvsd.mongodb.net/SpanCock?retryWrites=true&w=majority";

    // const client=new MongoClient(url)

    // await client.connect()

    ChatRoom.save();

    // mongoose.connect(url, function (err, client) {
    //   var db = client.db("db2");
    //   if (err) throw err;
    //   //students is a collection we want to create inside db2
    //   db.createCollection("students", function (err, res) {
    //     if (err) throw err;
    //     console.log("Collection created!");
    //     client.close();
    //   });
    // });
  } catch (err) {
    res.json(err);
    console.log(err);
  }
});

router.get("/request/myrequests/:userId", auth, async (req, res) => {
  try {
    const User1 = await User.find({
      // members: { $in: [req.params.userId] },
      _id: req.params.userId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    });
    res.json(User1);

    // const user = await User.findById(req.user.id).select("-password");
    // res.json(user.Pendingfriends);
  } catch (err) {
    res.json(err);
    console.log(err);
  }
});

router.post("/request/myrequests/:userId/accept", auth, async (req, res) => {
  try {
    // const User1 = await User.find({
    //   // members: { $in: [req.params.userId] },
    //   _id: req.params.userId,
    //   // Pendingfriends: { $in: [req.params.userId] },
    //   // name: name,
    // });
    // res.json(User1);

    const user = await User.findById(req.params.userId).select("-password");
    res.json(user);
    const updated = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        // $addToSet: { chatid: [{mid: req.body.value}]}
        // Pendingfriends: { $addToSet: ["Karan"] },
        // Pendingfriends: { $inSet: ["Naman"] },
      },
      // { name: "samank" }
      // { Pendingfriends: { $addToSet: ["Naman"] } }

      { $in: { friends: [user.name] } },
      { $pullAll: { Pendingfriends: [user.name] } }
    );

    // const user = await User.findById(req.user.id).select("-password");
    // res.json(user.Pendingfriends);
  } catch (err) {
    res.json(err);
    console.log(err);
  }
});

router.get("/me/user", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-friends -Pendingfriends -password -RequestSent"
  );
  res.json(user);
  console.log(user.name);
});

router.post("/:userId/addfriendrequest", auth, async (req, res) => {
  try {
    const frienduser = await User.findById({
      // members: { $in: [req.params.userId] },
      _id: req.params.userId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    });
    if (req.params.userId == req.user.id) {
      res.json("You can sent request to yourself");
    } else {
      const User1 = await User.find({
        // members: { $in: [req.params.userId] },
        _id: req.params.userId,
        // Pendingfriends: { $in: [req.params.userId] },
        // name: name,
      });
      const user = await User.findById(req.user.id).select(
        "-friends -Pendingfriends -password -RequestSent"
      );
      // res.json(user);
      console.log(user.name);

      const selfupdate = await User.findOneAndUpdate(
        {
          _id: req.user.id,
        },
        { $addToSet: { RequestSent: [frienduser.name] } }
      );

      const updated = await User.findOneAndUpdate(
        {
          _id: req.params.userId,
          // $addToSet: { chatid: [{mid: req.body.value}]}
          // Pendingfriends: { $addToSet: ["Karan"] },
          // Pendingfriends: { $inSet: ["Naman"] },
        },

        // { name: "samank" }
        // { Pendingfriends: { $addToSet: ["Naman"] } }
        {
          $addToSet: {
            Pendingfriends: [user],
          },
        }
      );
      res.json(` Friend Request successfully sent to ${frienduser.name}`);
    }
    // .then((updatedval) => {
    //   res.status(200).json(updatedval);
    //   console.log(updatedval);
    // });

    // const reply = await updated;
    // res.status(200).json(reply);
    // console.log(updated);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

router.post("/:userId/cancelfriendrequest", auth, async (req, res) => {
  try {
    const User1 = await User.find({
      // members: { $in: [req.params.userId] },
      _id: req.params.userId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    });
    const user = await User.findById(req.user.id).select(
      "-friends -Pendingfriends -password -RequestSent"
    );
    res.json(user);
    console.log(user.name);
    const updated = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
        // $addToSet: { chatid: [{mid: req.body.value}]}
        // Pendingfriends: { $addToSet: ["Karan"] },
        // Pendingfriends: { $inSet: ["Naman"] },
      },
      // { name: "samank" }

      // { $addToSet: { Pendingfriends: [user] } }
      { $pullAll: { Pendingfriends: [user.name] } }
    );

    // .then((updatedval) => {
    //   res.status(200).json(updatedval);
    //   console.log(updatedval);
    // });
    // const reply = await updated;
    // res.status(200).json(reply);
    // console.log(updated);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

router.post("/:userId/deletefriendrequest", auth, async (req, res) => {
  try {
    const User1 = await User.find({
      // members: { $in: [req.params.userId] },
      _id: req.params.userId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    });
    const user = await User.findById(req.user.id).select(
      "-friends -Pendingfriends -password -RequestSent"
    );
    res.json(user);
    console.log(user.name);
    const updated = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
        // $addToSet: { chatid: [{mid: req.body.value}]}
        // Pendingfriends: { $addToSet: ["Karan"] },
        // Pendingfriends: { $inSet: ["Naman"] },
      },
      // { name: "samank" }

      // { $addToSet: { Pendingfriends: [user] } }
      { $pullAll: { Pendingfriends: [user.name] } }
    );

    // .then((updatedval) => {
    //   res.status(200).json(updatedval);
    //   console.log(updatedval);
    // });
    // const reply = await updated;
    // res.status(200).json(reply);
    // console.log(updated);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

router.post("/:userId/confirmfriendrequest", auth, async (req, res) => {
  try {
    const mine = await User.findById(req.user.id).select(
      "-friends -Pendingfriends -password -RequestSent"
    );
    // console.log(mine.Pendingfriends);
    // const present = mine.Pendingfriends;

    const user = await User.findById(req.params.userId).select(
      "-friends -Pendingfriends -password -RequestSent"
    );
    // res.json(user);
    const updated = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        // $addToSet: { chatid: [{mid: req.body.value}]}
        // Pendingfriends: { $addToSet: ["Karan"] },
        // Pendingfriends: { $inSet: ["Naman"] },
      },
      // { name: "samank" }
      // { Pendingfriends: { $addToSet: ["Naman"] } }
      { $addToSet: { friends: [user] } },
      { $pullAll: { Pendingfriends: [user] } }
    );

    // .then((updatedval) => {
    //   res.status(200).json(updatedval);
    //   console.log(updatedval);
    // });
    // const reply = await updated;
    // res.status(200).json(reply);
    // console.log(updated);

    const chatroom = new ChatRoom({
      users: [user, mine],
    });

    await chatroom.save();

    res.json(`${user.name} is successfully added to your friends list`);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

// router.get("/:userId/addfriend", auth, async (req, res) => {
//   try {
//     const User1 = await User.find({
//       _id: req.params.userId,
//     });
//     const user = await User.findById(req.body.id).select("-password");
//     res.json(user);

//     const updated = await User.findOneAndUpdate(
//       {
//         _id: req.params.userId,
//       }
//       // { $addToSet: { Pendingfriends: ["Lollipop"] } }
//     ).then((updatedval) => {
//       res.status(200).json(updatedval);
//       console.log(updatedval);
//     });
//   } catch (err) {
//     res.status(500).json(err);
//     console.log(err);
//   }
// });

// router.post("/:userId/removefriend", auth, async (req, res) => {
//   try {
//     const User1 = await User.find({
//       _id: req.params.userId,
//     });

//     const user = await User.findById(req.user.id).select("-Pendingfriends");
//     // res.json(user);

//     const updated = await User.findOneAndUpdate(
//       {
//         _id: req.params.userId,
//       },
//       { $pullAll: { Pendingfriends: [user.id] } }
//     )
//       .then((updatedval) => {
//         res.status(200).json(updatedval);
//         console.log(updatedval);
//       })
//       .catch((err) => {
//         res.status(500).json(err);
//       });
//   } catch (err) {
//     res.status(500).json(err);
//     // console.log(err.message);
//   }
// });

router.get("/n1/requests/all", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user.Pendingfriends);
    console.log(user.Pendingfriends);
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});

router.get("/n1/myfriends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user.friends);
    console.log(user.friends);
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});

router.get("/n1/requests/:userId", auth, async (req, res) => {
  try {
    const ReqUser = await User.find({
      // members: { $in: [req.params.userId] },
      _id: req.params.userId,
      // Pendingfriends: { $in: [req.params.userId] },
      // name: name,
    }).select("-Pendingfriends");
    res.send(ReqUser);
    res.status(200).json(ReqUser.id);
    // const user = await User.findById(req.user.id).select("-password");

    console.log(ReqUser);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

router.post("/n1/requests/:userId/acceptfriend", auth, async (req, res) => {
  try {
    const User1 = await User.find({
      _id: req.params.userId,
    });

    const user123 = await User.findById(req.user.id).select("-password");
    // res.json(user123);
    const adduser = await User.findById(User1).select("-password");
    // res.json(adduser);

    const updated = await User.findOneAndUpdate(
      {
        _id: user123.id,
      },

      { $pullAll: { Pendingfriends: [adduser] } }
      // { $in: { friends: [req.params.userId] } }
      // { $pullAll: { Pendingfriends: [user.id] } }
    );
    // .then((updatedval) => {
    //   res.status(200).json(updatedval);
    //   console.log(updatedval);
    // })
    // .catch((err) => {
    //   res.status(500).json(err);
    // });
    res.send(updated);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

module.exports = router;

// $addToSet: { chatid: [{mid: req.body.value}]}
// Pendingfriends: { $addToSet: ["Karan"] },
// Pendingfriends: { $inSet: ["Naman"] },

// Pendingfriends: { $in: [req.params.userId] },
// name: name,

// members: { $in: [req.params.userId] },

// $addToSet: { chatid: [{mid: req.body.value}]}
// Pendingfriends: { $addToSet: ["Karan"] },
// Pendingfriends: { $inSet: ["Naman"] },

// { name: "samank" }
// { Pendingfriends: { $addToSet: ["Naman"] } }

// const reply = await updated;
// res.status(200).json(reply);
// console.log(updated);

// { name: "samank" }
// { Pendingfriends: { $addToSet: ["Naman"] } }

// const reply = await updated;
// res.status(200).json(reply);
// console.log(updated);

// Pendingfriends: { $in: [req.params.userId] },
// name: name,

// members: { $in: [req.params.userId] },
