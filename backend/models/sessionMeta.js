const mongoose = require("mongoose");

// Lightweight per-session metadata (title, etc.). Session identity is a client-
// generated string; primary index is (userId, sessionId).
const sessionMetaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: { type: String, required: true },
    title: { type: String, default: "" },
    // Whether the auto-titler has already run for this session, to avoid re-calling AI.
    autoTitled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sessionMetaSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model("SessionMeta", sessionMetaSchema);
