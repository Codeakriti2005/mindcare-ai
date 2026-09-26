const mongoose = require("mongoose");

const safetyEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    level: {
      type: String,
      enum: ["medium", "high"],
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ["companion"],
      default: "companion",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SafetyEvent",
  safetyEventSchema
);