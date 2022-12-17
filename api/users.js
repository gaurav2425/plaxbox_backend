const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const router = express.Router();
const geoip = require("geoip-lite");
const Profile = require("../models/Profile");
const { update } = require("../models/User");
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const { Auth, LoginCredentials } = require("two-step-auth");

//@route api/users
//@desc Register User
//@access Public

router.post(
  "/",
  [
    check("name", "Must Include Name").not().isEmpty(),
    check("username", "Please Enter Valid Username").not().isEmpty(),
    check("email", "Must Include Valid Email").isEmail(),
    check("dob", "Please Enter Date of birth").not().isEmpty(),
    check("avatar", "Please Enter Avatar").not().isEmpty(),
    check("password", "Must password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);

    const { name, username, bio, avatar, email, password, dob } = req.body;

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
      } else {
        var ip = "207.97.227.239";
        // const ip =
        //   req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log("I am Address");
        console.log(ip); // ip address of the user
        var geo = geoip.lookup(ip);
        console.log(geo);

        // console.log(lookup(ip));
        console.log("I am Address");

        user = new User({
          name,
          username,
          bio,
          avatar,
          email,
          password,
          dob,
          geo,
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // profileFields = { name, username, bio, dob };
        // profileFields.user = user.id;

        // profile = new Profile(profileFields);
        // await profile.save();

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
          }
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  }
);

router.get("/", (req, res) => {
  Profile.find((err, data) => {
    if (err) {
      // res.status(500).send(err);
      res.status(500).json(err);
    } else {
      // res.status(201).send(data);
      res.status(200).json(data);
    }
  });
});

router.get("/public/:userId", async (req, res) => {
  try {
    const User1 = await Profile.find({
      // members: { $in: [req.params.userId] },
      user: req.params.userId,
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

// router.get("/me/user", auth, async (req, res) => {
//   const user = await Profile.findOne(req.user.id).select(
//     "-friends -Pendingfriends -password -RequestSent"
//   );
//   res.json(user);
//   console.log(user.name);
// });

// router.post("/:userId/deletefriendrequest", auth, async (req, res) => {
//   try {
//     const User1 = await User.find({
//       // members: { $in: [req.params.userId] },
//       _id: req.params.userId,
//       // Pendingfriends: { $in: [req.params.userId] },
//       // name: name,
//     });
//     const user = await User.findById(req.user.id).select(
//       "-friends -Pendingfriends -password -RequestSent"
//     );
//     res.json(user);
//     console.log(user.name);
//     const updated = await User.findOneAndUpdate(
//       {
//         _id: req.params.userId,
//         // $addToSet: { chatid: [{mid: req.body.value}]}
//         // Pendingfriends: { $addToSet: ["Karan"] },
//         // Pendingfriends: { $inSet: ["Naman"] },
//       },

//       { $pullAll: { Pendingfriends: [user.name] } }
//     );

//   } catch (err) {
//     res.status(500).json(err);

//   }
// });

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

//Final Routes
//Final Routes
//Final Routes
//Final Routes
//Final Routes

router.post("/:userId/addfriendrequest", auth, async (req, res) => {
  try {
    const frienduser = await Profile.findOne({
      user: req.params.userId,
    }).select("-RequestSent -Notifications -PendingFriends -Friends");
    console.log(frienduser);
    if (req.params.userId == req.user.id) {
      res.json("You can't sent request to yourself");
    } else {
      const mine = await Profile.findOne({
        user: req.user.id,
      }).select(
        "-RequestSent -Notifications -PendingFriends -Friends -name -username"
      );

      // console.log(mine);

      const updatedfriend = await Profile.findOneAndUpdate(
        {
          user: req.params.userId,
        },
        {
          $addToSet: {
            PendingFriends: [mine],
          },
        },
        {
          new: true,
        }
      );

      const updatedfriend1 = await Profile.findOneAndUpdate(
        {
          user: req.params.userId,
        },
        {
          $addToSet: {
            Followers: [mine],
          },
        },
        {
          new: true,
        }
      );

      const updatedfriendnotification = await Profile.findOneAndUpdate(
        {
          user: req.params.userId,
        },
        {
          $addToSet: {
            Notifications: [`${mine.name} sent you friend Request`],
          },
        },
        {
          new: true,
        }
      );

      const mineupdated = await Profile.findOneAndUpdate(
        {
          user: req.user.id,
        },
        {
          $addToSet: {
            RequestSent: [frienduser],
          },
        },
        {
          new: true,
        }
      );

      const mineupdated1 = await Profile.findOneAndUpdate(
        {
          user: req.user.id,
        },
        {
          $addToSet: {
            Following: [frienduser],
          },
        },
        {
          new: true,
        }
      );

      res.json(` Friend Request successfully sent to ${frienduser.name}`);
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
    throw err;
  }
});

router.post("/:userId/cancelfriendrequest", auth, async (req, res) => {
  try {
    const frienduser = await Profile.findOne({
      user: req.params.userId,
    }).select("-RequestSent -Notifications -PendingFriends -Friends");
    console.log(frienduser);

    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends -password -RequestSent -Notifications -Friends"
    );
    console.log(mine);

    const updatedfriend = await Profile.findOneAndUpdate(
      {
        user: req.params.userId,
      },
      {
        $pullAll: {
          PendingFriends: [mine],
        },
      }
    );

    const updatedfriendnotification = await Profile.findOneAndUpdate(
      {
        user: req.params.userId,
      },
      {
        $pullAll: {
          Notifications: [`${mine.name} sent you friend Request`],
        },
      },
      {
        new: true,
      }
    );

    const updatedmine = await Profile.findOneAndUpdate(
      {
        user: req.user.id,
      },
      { $pullAll: { RequestSent: [frienduser] } }
    );
    res.json("Friend Request Cancelled successfully");
  } catch (err) {
    res.status(500).json(err);
    throw err;
  }
});

router.get("/requests/all", auth, async (req, res) => {
  try {
    const myrequests = await Profile.findOne({ user: req.user.id });
    res.json(myrequests.PendingFriends);
    // console.log(req.user.id);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.post("/:userId/deletefriendrequest", auth, async (req, res) => {
  try {
    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends -password -RequestSent -Notifications -Friends"
    );

    // res.json(mine);
    console.log(mine);

    const frienduser = await Profile.findOne({
      user: req.params.userId,
    }).select("-RequestSent -Notifications -PendingFriends -Friends");
    console.log(frienduser);
    // res.json(frienduser);

    const updatedfriend = await Profile.findOneAndUpdate(
      {
        user: req.params.userId,
      },
      {
        $pullAll: {
          RequestSent: [mine],
        },
      }
    );
    console.log(updatedfriend);

    const updatedmine = await Profile.findOneAndUpdate(
      {
        user: req.user.id,
      },
      { $pullAll: { PendingFriends: [frienduser] } }
    );
    res.json("Friend Request Deleted successfully");
  } catch (err) {
    res.status(500).json(err);
    throw err;
  }
});

router.post("/:userId/confirmfriendrequest", auth, async (req, res) => {
  try {
    const frienduser = await Profile.findOne({
      user: req.params.userId,
    }).select("-PendingFriends -RequestSent -Notifications -Friends");
    console.log(frienduser);

    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends  -RequestSent -Notifications -Friends"
    );
    console.log(mine);

    const updated = await Profile.findOneAndUpdate(
      {
        user: req.user.id,
      },

      { $addToSet: { Friends: [frienduser] } }
    );

    const updated1 = await Profile.findOneAndUpdate(
      {
        user: req.user.id,
      },
      { $pullAll: { PendingFriends: [frienduser] } }
    );

    console.log(updated);

    const updatedfriend = await Profile.findOneAndUpdate(
      {
        user: req.params.userId,
      },
      {
        $pullAll: {
          RequestSent: [mine],
        },
      }
    );

    const updatedfriend1 = await Profile.findOneAndUpdate(
      {
        user: req.params.userId,
      },

      { $addToSet: { Friends: [mine] } }
    );

    console.log(updatedfriend);

    const chatroom = new ChatRoom({
      users: [req.params.userId, req.user.id],
    });

    try {
      const findRoom = await ChatRoom.find({
        users: { $eq: [req.params.userId, req.user.id] },
      });
      console.log("MY Rooms");
      console.log(findRoom);
      console.log("MY Rooms");
      if (findRoom.length > 0) {
        console.log("Room Alredy Exist");
      } else {
        const savedRoom = await chatroom.save();
        console.log(savedRoom);
        console.log("Room Created");
        // res.json(
        //   `${frienduser.name} is successfully added to your friends list`
        // );
      }
    } catch (err) {
      res.status(500).json(err);
      throw err;
    }

    // const savedRoom = await chatroom.save();
    // console.log(savedRoom);
    res.json(`${frienduser.name} is successfully added to your friends list`);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
    throw err;
  }
});

router.get("/mine/mychatrooms", auth, async (req, res) => {
  try {
    const mine = await ChatRoom.find({
      users: { $in: [req.user.id] },
    });
    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.post("/:userId/newmessage", auth, async (req, res) => {
  try {
    const chats = new Message({
      // senderId: req.user.id,
      // receiverId: req.params.userId,
      // message: req.body.message,
      // received: req.body.received,
      receiverId: req.params.userId,
      senderId: req.user.id,
      message: req.body.message,
      received: false,
      lastmessage: req.body.lastmessage,
    });
    console.log(chats);

    const savemsg = await chats.save();

    const mine = await ChatRoom.findOneAndUpdate(
      {
        $or: [
          { users: { $eq: [req.params.userId, req.user.id] } },
          { users: { $eq: [req.user.id, req.params.userId] } },
        ],
      },
      // {
      //   messages: { $addToSet: [await chats.save()] },
      // },
      { $push: { messages: [savemsg] } }

      // { $addToSet: { Friends: [mine] } }
    );
    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.post("/chatroom/lastmessage", auth, async (req, res) => {
  try {
    const { lastmessage, receiverId } = req.body;
    const mine = await ChatRoom.findOneAndUpdate(
      {
        $or: [
          { users: { $eq: [receiverId, req.user.id] } },
          { users: { $eq: [req.user.id, receiverId] } },
        ],
      },

      { $set: { lastmessage: lastmessage } }
    );
    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.get("/:userId/readmessage", auth, async (req, res) => {
  try {
    // const chats = new Message({
    //   senderId: req.user.id,
    //   receiverId: req.params.userId,
    //   message: req.body.message,
    // });

    // const savemsg = await chats.save();

    const mine = await ChatRoom.findOne({
      $or: [
        { users: { $eq: [req.params.userId, req.user.id] } },
        { users: { $eq: [req.user.id, req.params.userId] } },
      ],
    });
    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});

router.put("/readmessage", auth, async (req, res) => {
  try {
    // const chats = new Message({
    //   senderId: req.user.id,
    //   receiverId: req.params.userId,
    //   message: req.body.message,
    // });

    // const savemsg = await chats.save();

    const { userId } = req.body;

    const mine = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
    });

    // const mine = await Message.findOne({
    //   $or: [
    //     { senderId: { $eq: userId } },
    //     { senderId: { $eq: req.user.id } },
    //     { receiverId: { $eq: userId } },
    //     { receiverId: { $eq: req.user.id } },
    //   ],
    // });

    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});

router.get("/myfriends/all", auth, async (req, res) => {
  try {
    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends  -RequestSent -Notifications"
    );
    console.log(mine);
    res.json(mine.Friends);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.get("/myfriends/all/:userId", auth, async (req, res) => {
  try {
    const frienduser = await Profile.findOne({
      user: req.params.userId,
    }).select("-PendingFriends  -RequestSent -Notifications");
    console.log(frienduser);
    res.json(frienduser);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.get("/mine/profile", auth, async (req, res) => {
  try {
    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends  -RequestSent -Notifications"
    );
    console.log(mine);
    res.json(mine.Friends);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.get("/mine/me", auth, async (req, res) => {
  try {
    const mine = await Profile.findOne({ user: req.user.id });
    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.get("/mine/notifications", auth, async (req, res) => {
  try {
    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends  -RequestSent"
    );
    console.log(mine);
    res.json(mine);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.get("/appusers/all", auth, async (req, res) => {
  try {
    const mine = await Profile.findOne({ user: req.user.id }).select(
      "-PendingFriends  -RequestSent -Notifications -Friends"
    );
    console.log(mine);

    const allusers = await Profile.find().select(
      "-PendingFriends -RequestSent -Notifications -Friends"
    );

    console.log(allusers);
    res.json(allusers);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.put("/getusername", async (req, res) => {
  try {
    const { username } = req.body;
    const findusername = await Profile.findOne({
      username: username,
    }).select(
      "-PendingFriends  -RequestSent -Notifications -Friends -mobiletoken -bio"
    );
    console.log(findusername);
    res.json(findusername);

    // const allusers = await Profile.find().select(
    //   "-PendingFriends -RequestSent -Notifications -Friends"
    // );

    // console.log(allusers);
    // res.json(allusers);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

router.put("/getemail", async (req, res) => {
  try {
    const { email } = req.body;
    const findemail = await User.findOne({
      email: email,
    }).select(
      "-PendingFriends  -RequestSent -Notifications -Friends -mobiletoken -bio"
    );
    console.log(findemail);
    res.json(findemail);

    // const allusers = await Profile.find().select(
    //   "-PendingFriends -RequestSent -Notifications -Friends"
    // );

    // console.log(allusers);
    // res.json(allusers);
  } catch (err) {
    console.error(err.message);
    res.json(err);
    throw err;
  }
});

//Final Routes
//Final Routes
//Final Routes
//Final Routes
//Final Routes

router.post("/test/otp", (req, res) => {
  async function login(emailId) {
    try {
      const res = await Auth(emailId, "PlaxBox");
      console.log(res);
      console.log(res.mail);
      console.log(res.OTP);
      console.log(res.success);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
  // This should have less secure apps enabled
  // LoginCredentials.mailID = "techxiosmedia@gmail.com";
  // You can store them in your env variables and
  // access them, it will work fine
  // LoginCredentials.password = "techxios2184";
  // LoginCredentials.use = true;
  // Pass in the mail ID you need to verify
  login("gauravburande2425@gmail.com");

  // async function login(emailId) {
  //   const res11 = await Auth(emailId, "PlaxBox");
  //   console.log(res11);
  //   console.log(res11.mail);
  //   console.log(res11.OTP);
  //   console.log(res11.success);
  //   res.json(res11);
  // }
  // login("gauravburande2425@gmail.com");
});

router.post("/test/otp/check", (req, res) => {});

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
