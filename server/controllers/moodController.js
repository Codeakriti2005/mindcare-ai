const Mood = require("../models/Mood");
const createUserNotification = require("../utils/notificationHelper");
const { checkAndNotifyStreak } = require("../utils/streakHelper");
// ================= CREATE MOOD =================

const createMood = async (req, res) => {
  try {
    const { mood, note } = req.body;

    if (!mood) {
      return res.status(400).json({
        message: "Mood is required",
      });
    }

    const moodEntry = await Mood.create({
      user: req.user.userId,
      mood,
      note,
    });

    
    // ================= AUTOMATIC NOTIFICATION =================

const moodLabels = {
  "very-happy": "Very Happy",
  happy: "Happy",
  okay: "Okay",
  sad: "Sad",
  "very-sad": "Very Sad",
  angry: "Angry",
  anxious: "Anxious",
  stressed: "Stressed",
};

const moodLabel = moodLabels[mood] || "your current mood";

await createUserNotification({
  userId: req.user.userId,
  type: "mood",
  title: "Mood check-in saved 😊",
  message: `Your ${moodLabel.toLowerCase()} mood check-in has been recorded. Keep taking a moment for yourself.`,
  icon: "😊",
});
// ================= STREAK CHECK =================

await checkAndNotifyStreak(req.user.userId);

    res.status(201).json({
      message: "Mood saved successfully",
      mood: moodEntry,
    });
  } catch (error) {
    console.error("Create Mood Error:", error.message);

    res.status(500).json({
      message: "Unable to save mood",
    });
  }
};

// ================= GET MOODS =================

const getMoods = async (req, res) => {
  try {
    const moods = await Mood.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(moods);
  } catch (error) {
    console.error("Get Moods Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch moods",
    });
  }
};

// ================= GET MOOD BY ID =================

const getMood = async (req, res) => {
  try {
    const mood = await Mood.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!mood) {
      return res.status(404).json({
        message: "Mood not found",
      });
    }

    res.status(200).json(mood);
  } catch (error) {
    console.error("Get Mood Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch mood",
    });
  }
};

// ================= DELETE MOOD =================

const deleteMood = async (req, res) => {
  try {
    const mood = await Mood.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!mood) {
      return res.status(404).json({
        message: "Mood not found",
      });
    }

    res.status(200).json({
      message: "Mood deleted successfully",
    });
  } catch (error) {
    console.error("Delete Mood Error:", error.message);

    res.status(500).json({
      message: "Unable to delete mood",
    });
  }
};

// ================= MOOD STATS =================

const getMoodStats = async (req, res) => {
  try {
    const moods = await Mood.find({
      user: req.user.userId,
    }).sort({ createdAt: 1 });

    const total = moods.length;

    const moodCounts = {};

    moods.forEach((item) => {
      moodCounts[item.mood] =
        (moodCounts[item.mood] || 0) + 1;
    });

    const recentMoods = moods.slice(-7).map((item) => ({
      mood: item.mood,
      date: item.createdAt,
    }));

    const moodValues = {
      "very-sad": 1,
      sad: 2,
      anxious: 2,
      stressed: 2,
      okay: 3,
      happy: 4,
      "very-happy": 5,
      angry: 2,
    };

    const moodTrend = moods.slice(-30).map((item) => ({
      date: item.createdAt,
      mood: item.mood,
      value: moodValues[item.mood] || 3,
    }));

    res.status(200).json({
      total,
      moodCounts,
      recentMoods,
      moodTrend,
    });
  } catch (error) {
    console.error("Mood Stats Error:", error.message);

    res.status(500).json({
      message: "Unable to fetch mood statistics",
    });
  }
};

module.exports = {
  createMood,
  getMoods,
  getMood,
  deleteMood,
  getMoodStats,
};