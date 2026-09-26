const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
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
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },

    sentiment: {
      type: String,
      enum: [
        "positive",
        "neutral",
        "negative",
        "unknown",
      ],
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Journal", journalSchema);