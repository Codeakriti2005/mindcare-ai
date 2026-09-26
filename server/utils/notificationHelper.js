const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const createUserNotification = async ({
  userId,
  type = "system",
  title,
  message,
  icon = "🔔",
}) => {
  try {
    // ================= BASIC VALIDATION =================

    if (!userId || !title || !message) {
      return null;
    }

    // ================= USER ID VALIDATION =================

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Notification Helper: Invalid user ID");
      return null;
    }

    // ================= TYPE VALIDATION =================

    const allowedTypes = [
      "mood",
      "journal",
      "insight",
      "streak",
      "system",
    ];

    if (!allowedTypes.includes(type)) {
      console.error("Notification Helper: Invalid notification type");
      return null;
    }

    // ================= TEXT CLEANING =================

    const cleanTitle = String(title).trim();
    const cleanMessage = String(message).trim();
    const cleanIcon = String(icon || "🔔").trim();

    // ================= LENGTH VALIDATION =================

    if (!cleanTitle || !cleanMessage) {
      return null;
    }

    if (cleanTitle.length > 100) {
      return null;
    }

    if (cleanMessage.length > 300) {
      return null;
    }

    if (cleanIcon.length > 20) {
      return null;
    }

    // ================= CREATE NOTIFICATION =================

    const notification = await Notification.create({
      user: userId,
      type,
      title: cleanTitle,
      message: cleanMessage,
      icon: cleanIcon,
    });

    return notification;
  } catch (error) {
    // Notification failure should NOT break
    // the main user action such as mood/journal/insight.
    console.error(
      "Notification Helper Error:",
      error.message
    );

    return null;
  }
};

module.exports = createUserNotification;