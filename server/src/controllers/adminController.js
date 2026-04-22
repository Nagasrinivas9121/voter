const FAQ = require("../models/FAQ");
const ElectionInfo = require("../models/ElectionInfo");
const User = require("../models/User");
const ChatSession = require("../models/ChatSession");
const { asyncHandler } = require("../middleware/errorHandler");
const cacheService = require("../services/cacheService");

// ─── FAQ Management ──────────────────────────────────────────────────────────

const getFAQs = asyncHandler(async (req, res) => {
  const { category, language, search } = req.query;
  const cacheKey = `faqs_${category || "all"}_${language || "en"}_${search || ""}`;

  const data = await cacheService.getOrSet(
    cacheKey,
    async () => {
      const query = { isPublished: true };
      if (category) query.category = category;
      if (language) query.language = language;
      if (search) query.$text = { $search: search };

      return FAQ.find(query).select("-__v").sort({ viewCount: -1 }).limit(50).lean();
    },
    120 // 2 min cache
  );

  res.status(200).json({ success: true, count: data.length, data });
});

const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create({ ...req.body, createdBy: req.user._id });
  cacheService.flush(); // Invalidate FAQ cache
  res.status(201).json({ success: true, message: "FAQ created", data: faq });
});

const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  );
  if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
  cacheService.flush();
  res.status(200).json({ success: true, data: faq });
});

const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
  cacheService.flush();
  res.status(200).json({ success: true, message: "FAQ deleted" });
});

// ─── Election Info Management ────────────────────────────────────────────────

const getElectionInfo = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const cacheKey = `election_info_${category || "all"}`;

  const data = await cacheService.getOrSet(
    cacheKey,
    async () => {
      const query = { isActive: true };
      if (category) query.category = category;
      return ElectionInfo.find(query).select("-__v").sort({ updatedAt: -1 }).lean();
    },
    300 // 5 min cache
  );

  res.status(200).json({ success: true, data });
});

const upsertElectionInfo = asyncHandler(async (req, res) => {
  const info = await ElectionInfo.findOneAndUpdate(
    { key: req.body.key },
    { ...req.body, updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );
  cacheService.flush();
  res.status(200).json({ success: true, data: info });
});

// ─── Admin Statistics ────────────────────────────────────────────────────────

const getStats = asyncHandler(async (req, res) => {
  const cacheKey = "admin_stats";
  const stats = await cacheService.getOrSet(
    cacheKey,
    async () => {
      const [totalUsers, totalChats, totalFAQs, recentUsers] = await Promise.all([
        User.countDocuments(),
        ChatSession.countDocuments(),
        FAQ.countDocuments({ isPublished: true }),
        User.find().sort({ createdAt: -1 }).limit(5).select("displayName email createdAt userType").lean(),
      ]);

      const usersByType = await User.aggregate([
        { $group: { _id: "$userType", count: { $sum: 1 } } },
      ]);

      return { totalUsers, totalChats, totalFAQs, recentUsers, usersByType };
    },
    60 // 1 min cache
  );

  res.status(200).json({ success: true, data: stats });
});

module.exports = { getFAQs, createFAQ, updateFAQ, deleteFAQ, getElectionInfo, upsertElectionInfo, getStats };
