const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    // chatRoomId: {
    //   type: String,
    //   // unique: true,
    //   default: Date.now(),
    // },
    users: {
      type: Array,
      default: [],
    },
    messages: {
      type: Array,
      default: [],
    },
    lastmessage: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = ChatRoom = mongoose.model("chatroom", ChatRoomSchema);
