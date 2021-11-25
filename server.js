const express = require("express");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const cors = require("cors");

const app = express();
app.use(cors());
connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is Home Route");
});

//Define Routes

app.use("/api/users", require("./api/users"));
app.use("/api/auth", require("./api/auth"));
app.use("/api/profile", require("./api/profile"));
app.use("/api/posts", require("./api/posts"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
