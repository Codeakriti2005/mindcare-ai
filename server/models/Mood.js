const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mood: {
      type: String,
      enum: [
        "very-happy",
        "happy",
        "okay",
        "sad",
        "very-sad",
        "angry",
        "anxious",
        "stressed",
      ],
      required: true,
    },

    note: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mood", moodSchema);