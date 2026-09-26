const User = require("../models/User");
const Mood = require("../models/Mood");
const Journal = require("../models/Journal");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const SafetyEvent = require("../models/SafetyEvent");

// ================= ADMIN OVERVIEW STATS =================

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMoods,
      totalJournals,
      totalConversations,
      totalNotifications,
      adminUsers,
      totalSafetyEvents,
      highRiskEvents,
      mediumRiskEvents,
    ] = await Promise.all([
      User.countDocuments(),

      Mood.countDocuments(),

      Journal.countDocuments(),

      Conversation.countDocuments(),

      Notification.countDocuments(),

      User.countDocuments({
        role: "admin",
      }),

      SafetyEvent.countDocuments(),

      SafetyEvent.countDocuments({
        level: "high",
      }),

      SafetyEvent.countDocuments({
        level: "medium",
      }),
    ]);

    return res.status(200).json({
      totalUsers,
      totalMoods,
      totalJournals,
      totalConversations,
      totalNotifications,
      adminUsers,
      totalSafetyEvents,
      highRiskEvents,
      mediumRiskEvents,
    });
  } catch (error) {
    console.error(
      "Admin Stats Error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to fetch admin statistics",
    });
  }
};

// ================= ADMIN MOOD ANALYTICS =================

const getAdminMoodAnalytics = async (req, res) => {
  try {
    const moodDistribution = await Mood.aggregate([
      {
        $group: {
          _id: "$mood",
          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const dailyMoodActivity = await Mood.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      moodDistribution,
      dailyActivity: dailyMoodActivity,
    });
  } catch (error) {
    console.error(
      "Admin Mood Analytics Error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to fetch mood analytics",
    });
  }
};

// ================= ADMIN USER ACTIVITY =================

const getAdminUserActivity = async (req, res) => {
  try {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const journalActivity = await Journal.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const conversationActivity =
      await Conversation.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    return res.status(200).json({
      userGrowth,
      journalActivity,
      conversationActivity,
    });
  } catch (error) {
    console.error(
      "Admin User Activity Error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to fetch user activity analytics",
    });
  }
};

// ================= EXPORTS =================

module.exports = {
  getAdminStats,
  getAdminMoodAnalytics,
  getAdminUserActivity,
};