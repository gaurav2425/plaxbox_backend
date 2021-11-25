const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  users: {
    type: Array,
    default: [],
  },
  messages: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = ChatRoom = mongoose.model("chatroom", ChatRoomSchema);
