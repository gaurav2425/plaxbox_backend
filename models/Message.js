const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    // conversationId: {
    //   type: String,
    // },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    received: {
      type: Boolean,
      default: false,
    },
    time: { type: Number, default: new Date().getTime() },
  },
  {
    timestamps: true,
  }
);

module.exports = Message = mongoose.model("message", MessageSchema);
