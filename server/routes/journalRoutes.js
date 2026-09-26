const express = require("express");

const {
  createJournal,
  getJournals,
  getJournal,
  deleteJournal,
  getJournalStats,
  generateJournalInsight,
} = require("../controllers/journalController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const { body } = require("express-validator");

const router = express.Router();

// ================= CREATE JOURNAL =================

router.post(
  "/",
  protect,

  body("content")
    .isString()
    .withMessage("Journal content must be text")
    .trim()
    .notEmpty()
    .withMessage("Journal content is required")
    .isLength({ max: 5000 })
    .withMessage(
      "Journal content cannot exceed 5000 characters"
    ),

  body("title")
    .optional()
    .isString()
    .withMessage("Journal title must be text")
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Journal title cannot exceed 100 characters"
    ),

  validate,

  createJournal
);

// ================= GET ALL JOURNALS =================

router.get(
  "/",
  protect,
  getJournals
);

// ================= JOURNAL STATISTICS =================

router.get(
  "/stats",
  protect,
  getJournalStats
);

// ================= GET SINGLE JOURNAL =================

router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getJournal
);

// ================= DELETE JOURNAL =================

router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  deleteJournal
);

// ================= AI JOURNAL INSIGHT =================

router.get(
  "/:id/insight",
  protect,
  validateObjectId("id"),
  generateJournalInsight
);

// ================= EXPORT =================

module.exports = router;