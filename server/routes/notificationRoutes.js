const express = require("express");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================= GET USER NOTIFICATIONS =================

router.get(
  "/",
  protect,
  getNotifications
);

// ================= MARK ALL AS READ =================

router.patch(
  "/read-all",
  protect,
  markAllAsRead
);

// ================= MARK SINGLE AS READ =================

router.patch(
  "/:id/read",
  protect,
  markAsRead
);

// ================= DELETE NOTIFICATION =================

router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;