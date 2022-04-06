const admin = require("firebase-admin");
const express = require("express");
const router = express.Router();
var serviceAccount = require("../slack-4b5d0-firebase-adminsdk-4i5nb-c03baa4402.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

router.post("/", (req, res) => {
  const { title, body, mbtoken } = req.body;
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: mbtoken,
    // data: {
    //   account: "Savings",
    //   balance: "$3020.25",
    // },

    // token:
    //   "e4s_8LySS8iJreF5HUqukq:APA91bEUDeBD2LGPqIVOgz3Er__1WytG_JWHPHk1rCRkPOA9lS1ymLmZ0xDKaXbwxwN6gEcvGsQVT_ipjcPn6FXDibx1NU_7Mh4ehT2mk_D-Zt9GrBbGqS8oKUvdPoOikALQZDUlz9pE",

    //   "eWcf189ZTXem59_s2l7FI2:APA91bEv9ZMFNDoReWXHwdV3M_t1AdpuUFBYglxBRcjatoyWmaCgPKlvnb70DnRL0LhIogTW1NO13-AhUwUm5rLmtfAnyFzOJ15mlqoGbw4OK_QnlkRWLkLZN_gGV8se7DZBegSLHCmc",
    //   "e4s_8LySS8iJreF5HUqukq:APA91bEUDeBD2LGPqIVOgz3Er__1WytG_JWHPHk1rCRkPOA9lS1ymLmZ0xDKaXbwxwN6gEcvGsQVT_ipjcPn6FXDibx1NU_7Mh4ehT2mk_D-Zt9GrBbGqS8oKUvdPoOikALQZDUlz9pE",

    //   "c4y6PtqpTNuJR38d_7kYPk:APA91bFTBEoS8mvyRKO25hRv2Zp6BoJZENIQSe6Y9-HwLyCsxbvbJlTgLnf0b-O_3Hn7bYvjbV6Nyi51bbYPPsO9eSfadY4GukGwO1bELjfNnEHIULCecKBGUN_ToFTIHhsV7oED2yfj",
  };

  admin
    .messaging()
    .send(message)
    .then((res) => {
      console.log("send success");
    })
    .catch((err) => {
      console.log(err);
    });
  res.json("Notification Sent");
});

module.exports = router;
