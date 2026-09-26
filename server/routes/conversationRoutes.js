const express = require("express");

const {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
} = require("../controllers/conversationController");

const protect = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

// ================= CREATE CONVERSATION =================

router.post(
  "/",
  protect,
  createConversation
);

// ================= GET USER CONVERSATIONS =================

router.get(
  "/",
  protect,
  getConversations
);

// ================= GET SINGLE CONVERSATION =================

router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getConversationById
);

// ================= DELETE CONVERSATION =================

router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  deleteConversation
);

module.exports = router;