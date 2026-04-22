const ChatSession = require("../models/ChatSession");
const User = require("../models/User");
const geminiService = require("../services/geminiService");
const { asyncHandler } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

/**
 * POST /api/chat/send
 * Send message to AI and save conversation
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId, language, userType } = req.body;
  const userId = req.user._id;
  const effectiveLanguage = language || req.user.language || "en";
  const effectiveUserType = userType || req.user.userType || "general";

  let session;
  let conversationHistory = [];

  if (sessionId) {
    // Only load last 6 messages for context window efficiency
    session = await ChatSession.findOne({ _id: sessionId, user: userId })
      .select("messages language userType");
    if (session) {
      conversationHistory = session.messages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));
    }
  }

  // Save user message immediately
  const userMessageObj = {
    role: "user",
    content: message,
    language: effectiveLanguage,
  };

  // Get AI response
  const aiResponse = await geminiService.sendMessage({
    message,
    userType: effectiveUserType,
    language: effectiveLanguage,
    conversationHistory,
  });

  const assistantMessageObj = {
    role: "assistant",
    content: aiResponse.content,
    language: effectiveLanguage,
    metadata: {
      tokens: aiResponse.tokens,
      responseTime: aiResponse.responseTime,
      model: aiResponse.model,
    },
  };

  if (session) {
    session.messages.push(userMessageObj, assistantMessageObj);
    session.language = effectiveLanguage;
    await session.save();
  } else {
    session = await ChatSession.create({
      user: userId,
      language: effectiveLanguage,
      userType: effectiveUserType,
      messages: [userMessageObj, assistantMessageObj],
    });
    // Increment user's total chats
    await User.findByIdAndUpdate(userId, { $inc: { totalChats: 1 } });
  }

  res.status(200).json({
    success: true,
    sessionId: session._id,
    message: {
      role: "assistant",
      content: aiResponse.content,
      timestamp: assistantMessageObj.timestamp || new Date(),
    },
  });
});

/**
 * GET /api/chat/sessions
 * Get all chat sessions for the authenticated user
 */
const getSessions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    ChatSession.find({ user: req.user._id, isArchived: false })
      .select("title messageCount lastActivity language createdAt")
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatSession.countDocuments({ user: req.user._id, isArchived: false }),
  ]);

  res.status(200).json({
    success: true,
    data: sessions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/chat/session/:id
 * Get a specific chat session with full message history
 */
const getSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();

  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  res.status(200).json({ success: true, data: session });
});

/**
 * DELETE /api/chat/session/:id
 * Archive (soft-delete) a chat session
 */
const deleteSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isArchived: true },
    { new: true }
  );

  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  res.status(200).json({ success: true, message: "Chat session deleted" });
});

module.exports = { sendMessage, getSessions, getSession, deleteSession };
