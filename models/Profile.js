const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    // required: true,
  },
  username: {
    type: String,
    // required: true,
  },
  bio: {
    type: String,
  },
  avatar: {
    type: String,
  },
  Friends: {
    type: Array,
  },
  PendingFriends: {
    type: Array,
  },
  RequestSent: {
    type: Array,
  },
  Notifications: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
