const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  tags: [String],
  verses: [
    {
      chapter: Number,
      verse: Number,
      shloka: String,
      translation: String,
      explanation: String,
      relevance: String,
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
}, { timestamps: true });

themeSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("Theme", themeSchema);
