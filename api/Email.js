const express = require("express");
const uuid = require("uuid");
const router = express.Router();
const Sib = require("sib-api-v3-sdk");
// const speakeasy = require("speakeasy");
const { google } = require("googleapis");
const Speakeasy = require("speakeasy");
require("dotenv").config();

const client = Sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SENDBLUE_API_KEY;

//@route api/users
//@desc Test route
//@access Public

const transEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
  email: "gauravburande2425@gmail.com",
};

router.post("/emailverify/sendotp", async (req, res) => {
  const { email } = req.body;
  const receivers = [
    {
      email: `${email}`,
    },
  ];

  let userid = uuid.v4();
  let temp_secret = Speakeasy.generateSecret();
  let secret1 = temp_secret.base32;
  // we only need the base32
  let OTP = Speakeasy.totp({ secret: secret1, encoding: "base32" });

  await transEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "OTP for Plaxbox",
      //   htmlContent: `${(
      //     <html>
      //       <body>
      //         <h1>{OTP}</h1>
      //       </body>
      //     </html>
      //   )}`,
      textContent: `Your OTP for Plaxbox is ${OTP}`,
      cc: [{ email: "gauravburande2425@gmail.com", name: "Gaurav Burande" }],
      bcc: [
        {
          email: "gauravburande2425@gmail.com",
          name: "Gaurav Burande",
        },
      ],
      replyTo: { email: "gauravburande2425@gmail.com", name: "Gaurav Burande" },
      headers: { "Some-Custom-Name": "unique-id-1234" },
      // params: { parameter: "My param value", subject: "New Subject" },
    })
    .then((data) => {
      console.log(data);
      //   res.json(data);
    })
    .catch((err) => {
      console.log(err);
      //   res.json(err);
    });

  res.json({
    userid,
    secret: temp_secret.base32,
    token: Speakeasy.totp({
      secret: secret1,
      encoding: "base32",
    }),
  });
});

router.post("/emailverify/verify", (request, response) => {
  let valid = Speakeasy.totp.verify({
    secret: request.body.secret,
    encoding: "base32",
    token: request.body.token,
    window: 5,
  });
  response.send({ valid: valid });
});

module.exports = router;
