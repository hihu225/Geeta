require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Groq = require("groq-sdk");

// Fail fast if critical env vars are missing
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

//import routes
const authRoutes = require("./authRoutes");
const auth = require("./middleware/auth");
const cronRoutes = require("./cronRoutes");
const generateBotResponse = require("./utils/generateBotResponse");
const scheduler = require('./services/scheduler');
const notificationRoutes = require('./routes/notifications');
const groqService = require('./services/groqService');
const Chat = require('./models/chat');
const Theme = require('./models/theme');
const SessionMeta = require('./models/sessionMeta');

const app = express();

// Static origins that are always allowed (dev + Capacitor).
const staticOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost",
  "capacitor://localhost",    // Capacitor Android
  "http://localhost",         // Capacitor iOS
];

// CLIENT_URL can be a single URL or a comma-separated list of URLs.
// e.g. CLIENT_URL="https://geeta-gpt14.vercel.app,https://custom-domain.com"
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [...staticOrigins, ...envOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser requests (curl, mobile shells) have no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow every Vercel preview / production URL for this project without
    // having to update env vars on each deploy.
    if (/^https:\/\/geeta-gpt[a-z0-9-]*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Rejected origin: ${origin}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth requests, please try again later." },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
  })
  .then(() => {
  console.log('Connected to MongoDB');
  
  // Start the scheduler after DB connection
  scheduler.start();
  console.log('Daily quotes scheduler initialized');
})
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize GROQ AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper function to call GROQ API
async function generateContent(prompt) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a wise spiritual guide with complete knowledge of the Bhagavad Gita."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2048
  });
  return {
    response: {
      text: () => completion.choices[0]?.message?.content || ""
    }
  };
}

const model = { generateContent };

//routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/cron", cronRoutes);
app.use("/api", apiLimiter);
// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});
// Handle User Queries
// Fire-and-forget: generate a 3-4 word title once a session has enough context.
async function maybeAutoTitle({ userId, sessionId }) {
  if (!sessionId) return;
  try {
    const meta = await SessionMeta.findOne({ userId, sessionId });
    if (meta?.autoTitled && meta?.title) return; // already done
    const chats = await Chat.find({ userId, sessionId }).sort({ createdAt: 1 }).limit(4);
    if (chats.length < 2) return; // wait for 2+ exchanges

    const transcript = chats
      .map((c) => `User: ${c.userMessage}\nBot: ${(c.botResponse || "").slice(0, 240)}`)
      .join("\n\n");
    const prompt = `Give a 3-5 word title that captures the theme of this conversation. Reply with ONLY the title text — no quotes, no punctuation at the end, no prefix like "Title:".\n\n${transcript}`;

    const ai = await model.generateContent(prompt);
    let title = ai.response.text().trim();
    // Strip surrounding quotes (straight + curly, open + close) and trailing punctuation.
    title = title
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
      .replace(/[.!?]+$/, "")
      .trim();
    if (!title || title.length > 60) return;

    await SessionMeta.findOneAndUpdate(
      { userId, sessionId },
      { $set: { userId, sessionId, title, autoTitled: true } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn("maybeAutoTitle failed:", err.message);
  }
}

app.post("/api/message", auth, async (req, res) => {
  try {
    const { message, chatHistory, sessionId } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const result = await generateBotResponse({
      message,
      chatHistory,
      sessionId: sessionId || null,
      model,
      translateToHindi,
      Theme,
      generateKrishnaAdvice,
      userId: req.user.userId,
    });

    const chat = new Chat({
      userMessage: message,
      ...result,
      userId: req.user.userId,
      sessionId: sessionId || null,
    });
    await chat.save();

    // Trigger auto-title in the background (never block the response).
    if (chat.sessionId) {
      maybeAutoTitle({ userId: req.user.userId, sessionId: chat.sessionId });
    }

    res.json({
      ...result,
      _id: chat._id,
      sessionId: chat.sessionId,
    });
  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({ error: "Failed to process message", details: error.message });
  }
});

// List conversations for the current user, newest first.
// Legacy chats (sessionId == null) are collapsed into one "Legacy" bucket.
app.get("/api/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const rows = await Chat.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $ifNull: ["$sessionId", "__legacy__"] },
          lastMessageAt: { $first: "$createdAt" },
          firstMessageAt: { $last: "$createdAt" },
          firstUserMessage: { $last: "$userMessage" },
          latestUserMessage: { $first: "$userMessage" },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const sessionIds = rows.map((r) => r._id).filter((id) => id !== "__legacy__");
    const metas = await SessionMeta.find({ userId, sessionId: { $in: sessionIds } });
    const titleBySession = new Map(metas.map((m) => [m.sessionId, m.title]));

    res.json({
      conversations: rows.map((r) => {
        const isLegacy = r._id === "__legacy__";
        const stored = !isLegacy ? titleBySession.get(r._id) : null;
        const fallback = (r.firstUserMessage || "Untitled").slice(0, 60);
        return {
          sessionId: isLegacy ? null : r._id,
          title: stored || fallback,
          hasAutoTitle: Boolean(stored),
          preview: (r.latestUserMessage || "").slice(0, 80),
          messageCount: r.messageCount,
          lastMessageAt: r.lastMessageAt,
          firstMessageAt: r.firstMessageAt,
          isLegacy,
        };
      }),
    });
  } catch (err) {
    console.error("Error listing conversations:", err);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

app.post("/api/themes", auth, async (req, res) => {
  try {
    const { name, description, tags, verses } = req.body;

    // Validate required fields
    if (!name || !description || !tags || !verses || !Array.isArray(verses)) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(req.user.userId);

    // Check if theme already exists
    const existingTheme = await Theme.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      userId: req.user.userId,
    });
    if (existingTheme) {
      return res
        .status(409)
        .json({ error: "Theme with this name already exists" });
    }

    // Create new theme
    const newTheme = new Theme({
      name,
      description,
      tags,
      verses,
      userId: req.user.userId,
    });

    await newTheme.save();
    res.status(201).json(newTheme);
  } catch (error) {
    console.error("Error creating theme:", error);
    res.status(500).json({ error: "Failed to create theme" });
  }
});
// Hindi translation function
async function translateToHindi(englishText) {
  try {
    
    const prompt = `Translate the following English text to Hindi:
    
    "${englishText}"
    
    Provide ONLY the Hindi translation without any explanations or additional text.`;

    try {
      const result = await model.generateContent(prompt);
      const hindiText = await result.response.text();
      return hindiText.trim();
    } catch (groqError) {
      console.error("GROQ translation error:", groqError);

      // Fallback to a simpler method
      console.log("Attempting fallback translation...");
      return "हिंदी अनुवाद उपलब्ध नहीं है"; // Default message if translation fails
    }
  } catch (error) {
    console.error("Translation error:", error);
    return "हिंदी अनुवाद उपलब्ध नहीं है"; // Default message if translation fails
  }
}
// Generate Krishna's Advice based on theme
function generateKrishnaAdvice(theme) {
  return `Based on the teachings of the Bhagavad Gita regarding ${theme.name.toLowerCase()}, 
  Krishna advises us to maintain equanimity and follow our dharma with detachment from results. 
  The key message is to perform our duties with full dedication while surrendering the outcome to the divine.`;
}
// Themes are generated per-user on demand via the AI; no global seed needed.
// Get Recent Chats
app.get("/api/chats", auth, async (req, res) => {
  try {
    const userId = req.user.userId; // extracted from auth middleware

    const chats = await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});
// Get all available themes
// Curated fallback themes so the UI never breaks if the AI errors out.
const FALLBACK_THEMES = [
  {
    name: "Karma Yoga — Action Without Attachment",
    description: "The path of selfless action, doing your duty without craving outcomes.",
    tags: ["karma", "duty", "action", "detachment"],
    verses: [
      {
        chapter: 2, verse: 47,
        shloka: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        translation: "You have the right to perform your actions, but never to the fruits of action.",
        explanation: "The principle of Nishkama Karma — act without being consumed by results.",
        relevance: "Anchors you when work feels overwhelming or outcomes feel out of reach.",
      },
    ],
  },
  {
    name: "Sthita Prajna — The Steady Mind",
    description: "Equanimity in pleasure and pain, praise and criticism.",
    tags: ["equanimity", "peace", "mind", "steadiness"],
    verses: [
      {
        chapter: 2, verse: 48,
        shloka: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
        translation: "Perform your duty established in yoga, abandoning attachment, even-minded in success and failure.",
        explanation: "Yoga is defined as equanimity — being unmoved by outcomes.",
        relevance: "For anyone caught in cycles of highs and lows, this teaches balance.",
      },
    ],
  },
  {
    name: "Bhakti — The Path of Devotion",
    description: "Surrender and love as a doorway to liberation.",
    tags: ["bhakti", "devotion", "surrender", "love"],
    verses: [
      {
        chapter: 18, verse: 66,
        shloka: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्ष्यिष्यामि मा शुचः॥",
        translation: "Abandon all varieties of dharma and simply surrender to Me. I shall liberate you from all sins; do not grieve.",
        explanation: "Total surrender frees the soul from the burden of moral bookkeeping.",
        relevance: "For those crushed by guilt or the weight of choices — a doorway to release.",
      },
    ],
  },
  {
    name: "Jnana — Self-Knowledge",
    description: "The path of discernment between the eternal Self and the impermanent.",
    tags: ["knowledge", "self", "wisdom", "discernment"],
    verses: [
      {
        chapter: 2, verse: 20,
        shloka: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥",
        translation: "The soul is never born, nor does it die; it is eternal, everlasting, and primeval — it is not slain when the body is slain.",
        explanation: "The Self is deathless; only the body is impermanent.",
        relevance: "For grief, fear of loss, or existential dread — this reframes identity.",
      },
    ],
  },
];

app.get("/api/themes", auth, async (req, res) => {
  try {
    const refresh = req.query.refresh === "true";

    // Return cached themes unless explicitly refreshing.
    if (!refresh) {
      const cached = await Theme.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      if (cached && cached.length > 0) {
        return res.json(cached);
      }
    }

    const chats = await Chat.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    const intents = chats
      .map((c) => c.intent)
      .filter(Boolean)
      .join(", ") || "general spiritual seeking, life guidance, dharma, purpose";

    const prompt = `
🎯 TASK:
Generate a **minimum of 4** unique theme objects based on the user intents: ${intents}

🚨 EXTREMELY IMPORTANT - SHLOKA FORMAT REQUIREMENT:
The "shloka" field MUST contain verses written ONLY in Sanskrit Devanagari script (the original Indian script that looks like this: धर्म, कर्म, योग).

❌ NEVER use Roman/Latin letters for Sanskrit like:
- "karmaṇy-evādhikāras te" ← THIS IS WRONG
- "duḥkheṣv anudvignā-manāḥ" ← THIS IS WRONG
- Any Sanskrit with English letters ← THIS IS WRONG

✅ ALWAYS use Devanagari script like:
- "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
- "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः"

🚫 THEME UNIQUENESS MANDATE:
Each theme MUST be completely unique in its name, concept, and content. DO NOT REPEAT any previously used theme name, description, or idea. Even partially similar themes should be strictly avoided. Repetition in any form (semantic or literal) will be considered a failure.

📋 REQUIRED JSON STRUCTURE:
Each theme must be a JSON object containing:
- "name": A concise, meaningful theme name
- "description": A brief explanation of the theme
- "tags": An array of relevant keywords (e.g., ["karma", "duty", "action"])
- "verses": An array of verse objects, each with:
  - "chapter": Chapter number (integer)
  - "verse": Verse number (integer)
  - "shloka": The verse in Devanagari script ONLY (like "धर्मक्षेत्रे कुरुक्षेत्रे...")
  - "translation": Accurate English translation
  - "explanation": Explanation of meaning and context
  - "relevance": Why this verse relates to the theme and user intent

🔥 CRITICAL SUCCESS CRITERIA:
1. Output **at least 4** completely **distinct** theme objects
2. Each **shloka MUST be in Devanagari script** (e.g., कर्म, धर्म, योग)
3. **NO Roman/Latin transliteration** allowed in "shloka" field
4. Output must be in **valid JSON array format only**
5. **No markdown formatting**, no code blocks, and **no extra text**
6. **Strictly no repeated themes** (by name, description, idea, or intent)

✅ EXACT OUTPUT FORMAT:
[
  {
    "name": "Theme Name Here",
    "description": "Brief theme description here",
    "tags": ["keyword1", "keyword2", "keyword3"],
    "verses": [
      {
        "chapter": 2,
        "verse": 47,
        "shloka": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        "translation": "You have the right to perform your actions, but never to the fruits of action. Do not let the fruits of action be your motive, nor let your attachment be to inaction.",
        "explanation": "This verse establishes the principle of Nishkama Karma - performing duty without attachment to results.",
        "relevance": "This verse directly addresses the theme by explaining how to act without being bound by outcomes."
      }
    ]
  }
]

🚨 FINAL REMINDER:
If even ONE "shloka" is in Roman letters instead of Devanagari, or if ANY theme is repeated in concept or name, the entire response is invalid. Strictly adhere to all formatting, uniqueness, and script rules.
`;

    let themes;
    try {
      const aiResponse = await model.generateContent(prompt);
      const text = aiResponse.response.text();

      let jsonOutput = text.trim();
      if (jsonOutput.startsWith("```")) {
        jsonOutput = jsonOutput
          .replace(/^```(?:json)?/, "")
          .replace(/```$/, "")
          .trim();
      }
      themes = JSON.parse(jsonOutput);
      if (!Array.isArray(themes) || themes.length === 0) throw new Error("Empty themes array");
    } catch (aiErr) {
      console.warn("Theme AI generation failed, using curated fallback:", aiErr.message);
      themes = FALLBACK_THEMES;
    }

    for (const theme of themes) {
      const escaped = String(theme.name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingTheme = await Theme.findOne({
        name: { $regex: new RegExp(`^${escaped}$`, "i") },
        userId: req.user.userId,
      });
      if (!existingTheme) {
        const newTheme = new Theme({
          ...theme,
          userId: req.user.userId,
        });
        await newTheme.save();
      }
    }
    const themeNames = themes.map((t) => t.name);
    const savedThemes = await Theme.find({
      name: { $in: themeNames },
      userId: req.user.userId,
    });

    res.json(savedThemes);
  } catch (error) {
    console.error("Error in /api/themes:", error);
    // Last-resort: if even the DB save failed, at least return cached themes if any.
    try {
      const cached = await Theme.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      if (cached && cached.length > 0) return res.json(cached);
    } catch {}
    res.status(500).json({ error: "Failed to load themes. Please try again." });
  }
});

// Get verses for a specific theme
app.get("/api/themes/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid theme ID format" });
    }

    const theme = await Theme.findOne({
      _id: id,
      userId: req.user.userId,
    }).select("name description tags verses");

    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }

    res.json({
      name: theme.name,
      description: theme.description,
      verses: theme.verses,
      krishnaAdvice: generateKrishnaAdvice(theme),
    });
  } catch (error) {
    console.error("Error fetching theme details:", error);
    res.status(500).json({ error: "Failed to fetch theme details" });
  }
});

// Search for themes by tags
app.get("/api/themes/search/:tag", auth, async (req, res) => {
  try {
    const { tag } = req.params;
    const escapedTag = String(tag || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Find themes with matching tag (regex escaped to prevent 500 on malformed input)
    const themes = await Theme.find({
      tags: { $regex: new RegExp(escapedTag, "i") },
      userId: req.user.userId,
    }).select("name description tags");

    res.json(themes);
  } catch (error) {
    console.error("Error searching themes:", error);
    res.status(500).json({ error: "Failed to search themes" });
  }
});

app.delete("/api/chats/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid chat ID format" });
    }

    // Find the chat first
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found with this ID" });
    }

    // Check if the chat belongs to the authenticated user
    if (chat.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this chat" });
    }

    // Delete the chat
    const deletedChat = await Chat.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Chat deleted successfully",
      deletedChat: {
        _id: deletedChat._id,
        userMessage: deletedChat.userMessage,
        createdAt: deletedChat.createdAt,
      },
    });
  } catch (error) {
    console.error("Error deleting chat by ID:", error);
    return res.status(500).json({ error: "Failed to delete chat" });
  }
});


app.delete("/api/chats/index/:index", auth, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({ error: "Invalid chat index" });
    }

    // Get all chats in order without a limit to ensure we have all chats
    const chats = await Chat.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    // Check if index is valid
    if (index >= chats.length) {
      return res.status(404).json({ error: "Chat index out of range" });
    }

    // Get the chat at the specified index
    const chatToDelete = chats[index];

    // Delete the chat by its ID
    const result = await Chat.findByIdAndDelete(chatToDelete._id);

    if (!result) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Return success response with the deleted chat info
    return res.json({
      success: true,
      message: "Chat deleted successfully",
      deletedChat: {
        _id: chatToDelete._id,
        userMessage: chatToDelete.userMessage,
        createdAt: chatToDelete.createdAt,
      },
    });
  } catch (error) {
    console.error("Error deleting chat by index:", error);
    return res.status(500).json({ error: "Failed to delete chat by index" });
  }
});

// Toggle Favorite Status
app.put("/api/chats/:id/favorite", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid chat ID format" });
    }
    if (typeof isFavorite !== "boolean") {
      return res.status(400).json({ error: "isFavorite must be a boolean" });
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isFavorite },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(updatedChat);
  } catch (error) {
    console.error("Error updating favorite status:", error);
    res.status(500).json({ error: "Failed to update favorite status" });
  }
});
app.put("/api/themes/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tags, verses } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid theme ID format" });
    }

    // Only update theme owned by this user, and update the actual fields
    const updatedTheme = await Theme.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, description, tags, verses },
      { new: true }
    );

    if (!updatedTheme) {
      return res.status(404).json({ error: "Theme not found" });
    }

    res.json(updatedTheme);
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ error: "Failed to update theme" });
  }
});
// Get Favorite Chats
app.get("/api/favorites", auth, async (req, res) => {
  try {
    const favorites = await Chat.find({
      userId: req.user.userId, // ensure only the user's chats are fetched
      isFavorite: true,
    }).sort({
      createdAt: -1,
    });
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

app.get("/api/share/:chatId", auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { language = "english" } = req.query;

    console.log("➡️ Request for chatId:", chatId);

    let chat;

    // Check if it's a valid ObjectId (for saved chats)
    if (mongoose.Types.ObjectId.isValid(chatId)) {
      chat = await Chat.findById(chatId);
    } else {
      // Otherwise, look for a chat with tempId
      chat = await Chat.findOne({ tempId: chatId });
    }

    if (!chat) {
      console.log("❌ Chat not found");
      return res.status(404).json({ error: "Chat not found" });
    }

    if (!chat.userId || chat.userId.toString() !== req.user.userId) {
      console.log("❌ Unauthorized access to chat");
      return res.status(403).json({ error: "Unauthorized access to chat" });
    }

    console.log("✅ Chat found:", chat);

    let responseText =
      language.toLowerCase() === "hindi" && chat.hindiResponse
        ? chat.hindiResponse
        : chat.botResponse;

    let shlokaInfo = chat.shloka || "";
    if (chat.translation) {
      shlokaInfo += `\n${chat.translation}`;
    }
    if (chat.chapter && chat.verse) {
      shlokaInfo += `\n(Bhagavad Gita ${chat.chapter}:${chat.verse})`;
    }

    const shareText = `🕉️ Bhagavad Gita Wisdom 🕉️\n\n✨ ${responseText}\n\n📖 Shloka: ${shlokaInfo}\n\n🔗 via Bhagavad Gita Bot`;

    console.log("✅ Generated share text:", shareText);
    res.json({ shareText });
  } catch (error) {
    console.error("❗ Error sharing chat:", error);
    res.status(500).json({ error: "Failed to generate shareable text" });
  }
});


app.get("/api/chats/:id/language/:language", auth, async (req, res) => {
  try {
    const { id, language } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid chat ID format" });
    }

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    if (chat.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to chat" });
    }

    // Return the response in the requested language
    if (language.toLowerCase() === "hindi") {
      // If Hindi translation doesn't exist yet, create it
      if (!chat.hindiResponse) {
        chat.hindiResponse = await translateToHindi(chat.botResponse);
        await chat.save();
      }
      return res.json({
        response: chat.hindiResponse || "Hindi translation not available",
        _id: chat._id,
      });
    } else {
      return res.json({
        response: chat.botResponse,
        _id: chat._id,
      });
    }
  } catch (error) {
    console.error("Error fetching chat in specified language:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});


app.get("/api/sidebar", auth, async (req, res) => {
  try {
    // Fetch only the necessary fields for sidebar navigation
    const sidebarItems = await Chat.find({
      userId: req.user.userId, // Ensure we only fetch the user's chats
    })
      .select("_id userMessage createdAt isFavorite")
      .sort({ createdAt: -1 })
      .lean();

    // Transform data for sidebar - include truncated message as title
    const formattedItems = sidebarItems.map((chat) => {
      // Create a truncated title with proper null/undefined checks
      let title = "Untitled";
      if (chat.userMessage) {
        title =
          chat.userMessage.length > 30
            ? `${chat.userMessage.substring(0, 30)}...`
            : chat.userMessage;
      }

      // Ensure _id is properly converted to string to avoid serialization issues
      return {
        _id: chat._id.toString(), 
        id: chat._id.toString(), 
        title: title,
        timestamp: chat.createdAt,
        isFavorite: Boolean(chat.isFavorite), // Ensure boolean type
      };
    });

    return res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching sidebar data:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch sidebar navigation data" });
  }
});
// Update chat message by ID
app.put("/api/chats/:id", auth, async (req, res) => {
  const { userMessage, botResponse, hindiResponse, shloka, translation, chapter, verse } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid chat ID format" });
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        userMessage,
        botResponse,
        hindiResponse,
        shloka,
        translation,
        chapter,
        verse,
      },
      { new: true }
    );
    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.json(updatedChat);
  } catch (error) {
    console.error("Error updating chat:", error);
    res.status(500).json({ error: "Failed to update chat" });
  }
});
//generate response but don't save for edit chat
app.post("/api/generate-response", auth, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    const result = await generateBotResponse({
      message,
      chatHistory,
      model,
      translateToHindi,
      Theme,
      generateKrishnaAdvice,
      userId: req.user.userId,
    });

    res.json(result);
  } catch (err) {
    console.error("Error generating chat:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});
// Rename a conversation (updates SessionMeta.title)
app.patch("/api/conversations/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });
    const clean = String(title || "").trim().slice(0, 80);
    if (!clean) return res.status(400).json({ error: "Title cannot be empty" });

    // Verify the session belongs to this user before renaming.
    const owned = await Chat.exists({ userId: req.user.userId, sessionId });
    if (!owned) return res.status(404).json({ error: "Conversation not found" });

    const updated = await SessionMeta.findOneAndUpdate(
      { userId: req.user.userId, sessionId },
      { $set: { userId: req.user.userId, sessionId, title: clean, autoTitled: true } },
      { upsert: true, new: true }
    );
    res.json({ sessionId: updated.sessionId, title: updated.title });
  } catch (err) {
    console.error("Rename conversation error:", err);
    res.status(500).json({ error: "Failed to rename conversation" });
  }
});

// Delete a whole conversation (all Chat docs + its SessionMeta).
app.delete("/api/conversations/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || sessionId === "null" || sessionId === "undefined") {
      return res.status(400).json({ error: "sessionId required" });
    }
    const result = await Chat.deleteMany({ userId: req.user.userId, sessionId });
    await SessionMeta.deleteOne({ userId: req.user.userId, sessionId });
    // If nothing matched, tell the caller — the UI shouldn't toast "deleted" on a stale row.
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

app.use('/api/notifications', notificationRoutes);
// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  try {
    scheduler.stop();
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
