const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// ================= GET NOTIFICATIONS =================

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to fetch notifications",
    });
  }
};

// ================= MARK ONE AS READ =================

const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          user: userId,
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark Notification Error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to update notification",
    });
  }
};

// ================= MARK ALL AS READ =================

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      {
        user: userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark All Notifications Error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to update notifications",
    });
  }
};

// ================= DELETE NOTIFICATION =================

const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to delete notification",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};