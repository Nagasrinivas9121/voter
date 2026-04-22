const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ["registration", "voting", "eligibility", "process", "technology", "general"],
      default: "general",
    },
    language: { type: String, enum: ["en", "te"], default: "en" },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

faqSchema.index({ category: 1, language: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ question: "text", answer: "text" });

module.exports = mongoose.model("FAQ", faqSchema);
