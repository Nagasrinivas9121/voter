const ChatSession = require("../models/ChatSession");
const { asyncHandler } = require("../middleware/errorHandler");
const cacheService = require("../services/cacheService");

/**
 * GET /api/dashboard/overview
 * User's personal dashboard overview
 */
const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cacheKey = `dashboard_${userId}`;

  const data = await cacheService.getOrSet(
    cacheKey,
    async () => {
      const [totalSessions, recentSessions] = await Promise.all([
        ChatSession.countDocuments({ user: userId, isArchived: false }),
        ChatSession.find({ user: userId, isArchived: false })
          .select("title messageCount lastActivity language")
          .sort({ lastActivity: -1 })
          .limit(5)
          .lean(),
      ]);

      return {
        totalChats: totalSessions,
        recentChats: recentSessions,
        userType: req.user.userType,
        language: req.user.language,
        memberSince: req.user.createdAt,
      };
    },
    30 // 30 sec cache
  );

  res.status(200).json({ success: true, data });
});

/**
 * GET /api/dashboard/activity
 * Activity data for chart visualization
 */
const getActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const days = parseInt(req.query.days) || 7;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const activity = await ChatSession.aggregate([
    { $match: { user: userId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        messages: { $sum: "$messageCount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ success: true, data: activity });
});

module.exports = { getOverview, getActivity };
