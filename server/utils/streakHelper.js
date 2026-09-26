const Mood = require("../models/Mood");
const createUserNotification = require("./notificationHelper");

// ==================================================
// GET CURRENT MOOD STREAK
// ==================================================

const getCurrentStreak = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const moods = await Mood.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();

    if (!moods.length) {
      return 0;
    }

    // ==============================================
    // GET UNIQUE CHECK-IN DATES
    // ==============================================

    const uniqueDates = new Set();

    moods.forEach((mood) => {
      const date = new Date(mood.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      // Use UTC date consistently.
      // This avoids depending on the server's local timezone.
      const dateKey = date.toISOString().slice(0, 10);

      uniqueDates.add(dateKey);
    });

    const sortedDates = Array.from(uniqueDates).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    if (!sortedDates.length) {
      return 0;
    }

    // ==============================================
    // CALCULATE CONSECUTIVE DAYS
    // ==============================================

    let streak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(
        `${sortedDates[i]}T00:00:00.000Z`
      );

      const previousDate = new Date(
        `${sortedDates[i + 1]}T00:00:00.000Z`
      );

      const differenceInDays = Math.round(
        (currentDate - previousDate) /
          (1000 * 60 * 60 * 24)
      );

      if (differenceInDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error(
      "Get Current Streak Error:",
      error.message
    );

    return 0;
  }
};

// ==================================================
// CHECK AND NOTIFY STREAK
// ==================================================

const checkAndNotifyStreak = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const streak = await getCurrentStreak(userId);

    const milestones = [3, 7, 14, 30];

    // Only notify on milestone streaks.
    if (!milestones.includes(streak)) {
      return streak;
    }

    // ==============================================
    // PREVENT DUPLICATE MILESTONE NOTIFICATIONS
    // ==============================================

    const Notification = require("../models/Notification");

    const alreadyNotified = await Notification.exists({
      user: userId,
      type: "streak",
      title: `${streak}-day streak! 🔥`,
    });

    if (alreadyNotified) {
      return streak;
    }

    // ==============================================
    // CREATE MILESTONE NOTIFICATION
    // ==============================================

    await createUserNotification({
      userId,
      type: "streak",
      title: `${streak}-day streak! 🔥`,
      message:
        `Amazing consistency! You've checked in for ${streak} days in a row. ` +
        `Keep taking time to check in with yourself.`,
      icon: "🔥",
    });

    return streak;
  } catch (error) {
    console.error(
      "Streak Helper Error:",
      error.message
    );

    return 0;
  }
};

module.exports = {
  getCurrentStreak,
  checkAndNotifyStreak,
};