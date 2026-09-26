const express = require("express");

const { chatWithAI } = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");

const { body } = require("express-validator");

const router = express.Router();

// ================= AI CHAT =================

router.post(
  "/chat",

  protect,

  body("message")
    .isString()
    .withMessage("Message must be text")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 3000 })
    .withMessage(
      "Message cannot exceed 3000 characters"
    ),

  body("conversationId")
    .optional({ nullable: true })
    .isString()
    .withMessage("Conversation ID must be text"),

  validate,

  chatWithAI
);

module.exports = router;