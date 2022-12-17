const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  validated: {
    type: Boolean,
    default: false,
  },
  geo: {
    type: Object,
    // default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model("user", UserSchema);

// status: {
//   type: String,
// },
// friends: {
//   type: Array,
// },
// Pendingfriends: {
//   type: Array,
//   default: [],
// },
// RequestSent: {
//   type: Array,
//   default: [],
// },
