const express = require("express");

const {
  createMood,
  getMoods,
  getMood,
  deleteMood,
  getMoodStats,
} = require("../controllers/moodController");

const protect = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.post(
  "/",
  protect,

  body("mood")
    .trim()
    .notEmpty()
    .withMessage("Mood is required"),

  validate,
  createMood
);
router.get("/", protect, getMoods);
router.get("/stats", protect, getMoodStats);
router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getMood
);

router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  deleteMood
);

module.exports = router;