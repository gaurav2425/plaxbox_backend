const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const { google } = require("googleapis");
const Speakeasy = require("speakeasy");
const xoauth2 = require("xoauth2");
const uuid = require("uuid");

require("dotenv").config();

const sgMail = require("@sendgrid/mail");

const CLIENT_ID =
  "985685462889-gd17k4qq5ngi5mapujcq0tshnl8h64p4.apps.googleusercontent.com";
const CLEINT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04DHKhptcb7y_CgYIARAAGAQSNwF-L9IrOv2JR5HRMaL-su1le7FszsbUWi4LL_B07aRefVUoog_tn68bXIhvWbrb21JHfqc4C4Q";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

router.post("/sendotp", (request, res) => {
  let userid = uuid.v4();
  // console.log("Tried");
  //   let path = `user/${userid}`;
  let temp_secret = speakeasy.generateSecret();
  //   db.push(path, { userid, temp_secret });
  let secret1 = temp_secret.base32;
  // we only need the base32
  let token1 = Speakeasy.totp({ secret: secret1, encoding: "base32" });

  res.json({
    userid,
    secret: temp_secret.base32,
    token: Speakeasy.totp({
      secret: secret1,
      encoding: "base32",
    }),
  });

  sgMail.setApiKey(
    "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"
  );

  let mailDetails = {
    to: "gauravburande2425@gmail.com", // Change to your recipient
    from: "gauravburande04@gmail.com", // Change to your verified sender
    subject: "Sending From Plaxbox",
    text: "OTP for plaxbox is",
    html: `<h1>${token1} </h1>`,
  };

  const sendMail = async (mailDetails) => {
    try {
      await sgMail.send(mailDetails);
      console.log("Message Sent Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  sendMail(mailDetails);
});

router.post("/api/totp-validate", (request, response, next) => {
  let valid = Speakeasy.totp.verify({
    secret: request.body.secret,
    encoding: "base32",
    token: request.body.token,
    window: 5,
  });
  response.send({ valid: valid });
});

router.post("/sendmail", (req, res) => {
  async function sendMail() {
    try {
      let userid = uuid.v4();
      // console.log("Tried");
      //   let path = `user/${userid}`;
      let temp_secret = speakeasy.generateSecret();
      //   db.push(path, { userid, temp_secret });
      let secret1 = temp_secret.base32;
      // we only need the base32
      let token1 = Speakeasy.totp({ secret: secret1, encoding: "base32" });

      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "plaxboxllp@gmail.com",
          clientId: CLIENT_ID,
          clientSecret: CLEINT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      const mailOptions = {
        from: "plaxboxllp@gmail.com",
        to: "gauravburande2425@gmail.com",
        subject: "Hello from gmail using API",
        text: "Hello from gmail email using API",
        html: `<h1>Hello from gmail email using API ${token1} </h1>`,
      };

      const result = await transport.sendMail(mailOptions);
      res.json(result);
      return result;
    } catch (error) {
      return error;
    }
  }

  sendMail()
    .then((result) => console.log("Email sent...", result))
    .catch((error) => console.log(error.message));
});

module.exports = router;
