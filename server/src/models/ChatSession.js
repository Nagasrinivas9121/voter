const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    language: { type: String, default: "en" },
    timestamp: { type: Date, default: Date.now },
    metadata: {
      tokens: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 },
      model: { type: String, default: "gemini-1.5-flash" },
    },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New Conversation", maxlength: 100 },
    messages: [messageSchema],
    language: { type: String, enum: ["en", "te"], default: "en" },
    userType: { type: String, default: "general" },
    isArchived: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSessionSchema.index({ user: 1, lastActivity: -1 });
chatSessionSchema.index({ user: 1, isArchived: 1 });

// Auto-generate title from first user message
chatSessionSchema.pre("save", function (next) {
  if (this.isModified("messages") && this.messages.length > 0 && this.title === "New Conversation") {
    const firstUserMsg = this.messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      this.title = firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? "..." : "");
    }
  }
  this.messageCount = this.messages.length;
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model("ChatSession", chatSessionSchema);
