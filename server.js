const http = require("http");
const express = require("express");
const connectDB = require("./config/db");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const Messages = require("./models/Message");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const admin = require("firebase-admin");

var serviceAccount = require("./slack-4b5d0-firebase-adminsdk-4i5nb-c03baa4402.json");

const app = express();
// app.use(cors());
app.use(express.json());
connectDB();

// CONNECTION_URL =
//   "mongodb+srv://admin:gaurav54321@cluster0.9mvsd.mongodb.net/SpanCock?retryWrites=true&w=majority";
// mongoose.connect(CONNECTION_URL, () => {
//   console.log("Connected to Database");
// });

app.get("/", (req, res) => {
  res.send("This is Home Route");
});

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const message = {
//   notification: {
//     title: "Cricket Team India",
//     body: "Virat kohli 1000 comes up",
//   },
//   token:
//     "e4s_8LySS8iJreF5HUqukq:APA91bEUDeBD2LGPqIVOgz3Er__1WytG_JWHPHk1rCRkPOA9lS1ymLmZ0xDKaXbwxwN6gEcvGsQVT_ipjcPn6FXDibx1NU_7Mh4ehT2mk_D-Zt9GrBbGqS8oKUvdPoOikALQZDUlz9pE",
// };

// admin
//   .messaging()
//   .send(message)
//   .then((res) => {
//     console.log("send success");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//Define Routes

app.use("/api/users", require("./api/users"));
app.use("/api/auth", require("./api/auth"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/posts", require("./api/posts"));
app.use("/api/notification", require("./api/notification"));
app.use("/api/bio", require("./api/bio"));
app.use("/api/avatar", require("./api/avatar"));
app.use("/api/username", require("./api/username"));
app.use("/api/otp", require("./api/otp"));

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  // Messages.create(dbMessage, (err, data) => {
  //   if (err) {
  //     res.status(500).send(err);
  //   } else {
  //     res.status(201).send(data);
  //   }
  // });
  res.status(201).send(data);
});
const server = http.createServer(app);

const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("New Connection SpanCock");

  socket.on("joined", () => {
    console.log("User Joined SpanCock");
  });

  socket.on("message", ({ message, id, receiverId, senderId }) => {
    io.emit("sendMessage", { message, id, receiverId, senderId });
    console.log(message, id, receiverId, senderId);
  });

  socket.on("welcome", () => {
    console.log("welcome to the chat SpanCock");
  });
  socket.on("forceDisconnect", () => {
    // socket.disconnect();
    console.log("Disconnected Successfully SpanCock");
  });
});

// require("dotenv").config();

// const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(
//   "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"
// );

const sendMail = async (msg) => {
  try {
    await sgMail.send(msg);
    console.log("Message Sent Successfully");
  } catch (error) {
    console.log(error.errors);
  }
};

// sendMail({
//   to: "gauravburande2425@gmail.com", // Change to your recipient
//   from: "gauravburande04@gmail.com", // Change to your verified sender
//   subject: "OTP Of Plaxbox",
//   text: "Hello from gmail email using API",
//   html: "and easy to do anywhere, even with Node.js",
// });

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
