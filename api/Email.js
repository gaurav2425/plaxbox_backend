const express = require("express");

const router = express.Router();

const Sib = require("sib-api-v3-sdk");

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

  await transEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "OTP for Plaxbox",
      htmlContent:
        "<html><body><h1>This is my first transactional email {{params.parameter}}</h1></body></html>",
      textContent: `Hey Otp for Plaxbox LLC is 2249`,
      cc: [{ email: "gauravburande2425@gmail.com", name: "Gaurav Burande" }],
      bcc: [
        {
          email: "gauravburande2425@gmail.com",
          name: "gauravburande2425@gmail.com",
        },
      ],
      replyTo: { email: "gauravburande2425@gmail.com", name: "Gaurav Burande" },
      headers: { "Some-Custom-Name": "unique-id-1234" },
      // params: { parameter: "My param value", subject: "New Subject" },
    })
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

module.exports = router;
