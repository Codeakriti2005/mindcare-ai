const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");

// ================= CREATE NEW CONVERSATION =================

const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      user: req.user.userId,
      title: "New Conversation",
      messages: [],
    });

    res.status(201).json({
      message: "Conversation created successfully",
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Conversation creation error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to create conversation",
    });
  }
};

// ================= GET USER'S CONVERSATIONS =================

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      user: req.user.userId,
    })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt")
      .lean();

    res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error(
      "Conversation fetch error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to fetch conversations",
    });
  }
};

// ================= GET ONE CONVERSATION =================

const getConversationById = async (req, res) => {
  try {
    const conversationId = req.params.id;

    // ================= VALIDATE ID =================

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    // ================= USER OWNERSHIP CHECK =================

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user.userId,
    }).lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      conversation,
    });
  } catch (error) {
    console.error(
      "Conversation fetch error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to fetch conversation",
    });
  }
};

// ================= DELETE CONVERSATION =================

const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;

    // ================= VALIDATE ID =================

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    // ================= USER OWNERSHIP CHECK =================

    const conversation =
      await Conversation.findOneAndDelete({
        _id: conversationId,
        user: req.user.userId,
      });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error(
      "Conversation deletion error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to delete conversation",
    });
  }
};

// ================= EXPORTS =================

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
};