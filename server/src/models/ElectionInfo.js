const mongoose = require("mongoose");

const electionInfoSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "timeline", "rules", "contacts", "announcement"],
      default: "general",
    },
    isActive: { type: Boolean, default: true },
    effectiveDate: { type: Date },
    expiryDate: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

electionInfoSchema.index({ key: 1, isActive: 1 });
electionInfoSchema.index({ category: 1 });

module.exports = mongoose.model("ElectionInfo", electionInfoSchema);
