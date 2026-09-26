const express = require("express");

const {
  getWellnessInsights,
} = require("../controllers/insightController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getWellnessInsights);

module.exports = router;