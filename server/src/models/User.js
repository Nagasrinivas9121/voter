const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    photoURL: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    userType: {
      type: String,
      enum: ["first_time", "student", "general", "nri", "differently_abled"],
      default: "general",
    },
    language: { type: String, enum: ["en", "te"], default: "en" },
    totalChats: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1, firebaseUid: 1 });

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName,
    photoURL: this.photoURL,
    role: this.role,
    userType: this.userType,
    language: this.language,
    totalChats: this.totalChats,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
