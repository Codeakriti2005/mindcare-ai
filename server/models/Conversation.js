const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "New Conversation",
    },

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);