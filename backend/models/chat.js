const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: { type: String, index: true, default: null },
    userMessage: String,
    botResponse: String,
    hindiResponse: String,
    shloka: String,
    translation: String,
    chapter: Number,
    verse: Number,
    intent: String,
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
