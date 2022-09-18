const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const { google } = require("googleapis");
const Speakeasy = require("speakeasy");
const xoauth2 = require("xoauth2");
const uuid = require("uuid");

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

router.post("/sendotp", (req, res) => {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "techxiosmedia@gmail.com",
      pass: "techxios21847335",
    },
  });

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

  let mailDetails = {
    from: "techxiosmedia@gmail.com",
    to: "gauravburande2425@gmail.com",
    subject: "Plabox",
    text: "OTP for two factor Authentication",
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      token1 +
      "</h1>", // html body
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
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
