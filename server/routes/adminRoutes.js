const express = require("express");

const {
  getAdminStats,
  getAdminMoodAnalytics,
  getAdminUserActivity,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin overview statistics
router.get("/stats", protect, adminOnly, getAdminStats);

router.get(
  "/mood-analytics",
  protect,
  adminOnly,
  getAdminMoodAnalytics
);
router.get(
  "/user-activity",
  protect,
  adminOnly,
  getAdminUserActivity
);

module.exports = router;