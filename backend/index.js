require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
//import routes
const authRoutes = require("./authRoutes");
const auth = require("./middleware/auth");
const cronRoutes = require("./cronRoutes");
const generateBotResponse = require("./utils/generateBotResponse");
const scheduler = require('./services/scheduler');
const notificationRoutes = require('./routes/notifications');
// const users = require("./models/usermodels");
const app = express();
const corsOptions = {
  origin: true, // Reflect request origin, allowing requests from anywhere
  credentials: true,
};

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost",
  "capacitor://localhost", // For Capacitor Android
  "http://192.168.x.x:5173",
  process.env.CLIENT_URL,
];

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

// Chat Schema & Model
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userMessage: String,
    botResponse: String,
    hindiResponse: String,
    shloka: String,
    translation: String,
    chapter: String,
    verse: String,
    intent: String,
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true } 
);


const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
// Theme Schema & Model
const themeSchema = new mongoose.Schema({
  name: String,
  description: String,
  tags: [String],
  verses: [
    {
      chapter: Number,
      verse: Number,
      shloka: String,
      translation: String,
      explanation: String,
      relevance: String, // "Why this verse?" explanation
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },
});

const Theme = mongoose.model("Theme", themeSchema);
module.exports = Theme;
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//routes
app.use("/api/auth", authRoutes); 
app.use("/api/cron", cronRoutes); 
// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});
// Handle User Queries
app.post("/api/message", auth, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const result = await generateBotResponse({
      message,
      chatHistory,
      model,
      translateToHindi,
      Theme,
      generateKrishnaAdvice,
    });

    const chat = new Chat({
      userMessage: message,
      ...result,
      userId: req.user.userId,
    });
    await chat.save();
    // Send response
     res.json({
      ...result,
      _id: chat._id,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Something went wrong" });
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
    } catch (genAIError) {
      console.error("Google GenAI translation error:", genAIError);

      // Fallback to a simpler method - this is temporary until you set up a proper translation service
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
// Initialize some themes if none exist
async function initializeThemes() {
  try {
    const themesCount = await Theme.countDocuments();

    if (themesCount === 0) {
      console.log("Initializing themes...");

      const initialThemes = [
        {
          name: "Stress",
          description: "Verses to help manage anxiety and stress",
          tags: ["stress", "anxiety", "peace", "calm", "overthinking"],
          verses: [
            {
              chapter: 2,
              verse: 14,
              shloka:
                "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत।।",
              translation:
                "O son of Kunti, the nonpermanent appearance of happiness and distress, and their disappearance in due course, are like the appearance and disappearance of winter and summer seasons. They arise from sense perception, and one must learn to tolerate them without being disturbed.",
              explanation:
                "This verse teaches us that all experiences are temporary, including stress and anxiety. By understanding their transient nature, we can develop resilience.",
              relevance:
                "When you're feeling stressed, this verse reminds you that difficult emotions are temporary states that will pass with time, not permanent conditions of your life.",
            },
            {
              chapter: 18,
              verse: 58,
              shloka:
                "मच्चित्तः सर्वदुर्गाणि मत्प्रसादात्तरिष्यसि।\nअथ चेत्त्वमहङ्कारान्न श्रोष्यसि विनङ्क्ष्यसि।।",
              translation:
                "If you become conscious of Me, you will pass over all the obstacles of conditioned life by My grace. If, however, you do not work in such consciousness but act through false ego, not hearing Me, you will be lost.",
              explanation:
                "This verse suggests surrendering to a higher power as a way to overcome life's difficulties, including stress.",
              relevance:
                "When overthinking and anxiety take over, this verse suggests redirecting your consciousness toward the divine to find relief from mental obstacles.",
            },
          ],
        },
        {
          name: "Purpose",
          description: "Guidance on finding meaning and purpose in life",
          tags: ["purpose", "meaning", "dharma", "duty", "calling"],
          verses: [
            {
              chapter: 2,
              verse: 47,
              shloka:
                "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि।।",
              translation:
                "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
              explanation:
                "This famous verse teaches the importance of fulfilling your purpose without attachment to results.",
              relevance:
                "When confused about your life's purpose, this verse reminds you to focus on doing your duty with full commitment rather than worrying about outcomes.",
            },
            {
              chapter: 3,
              verse: 35,
              shloka:
                "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः।।",
              translation:
                "It is better to perform one's own duties imperfectly than to master the duties of another. By fulfilling the obligations born of one's nature, a person never incurs sin.",
              explanation:
                "This verse emphasizes the importance of following your own unique path rather than imitating others.",
              relevance:
                "When you feel pressured to follow someone else's path or compare yourself to others, this verse reminds you that your true purpose is aligned with your own nature.",
            },
          ],
        },
        {
          name: "Love",
          description: "Teachings on love, attachment, and relationships",
          tags: [
            "love",
            "relationships",
            "attachment",
            "breakups",
            "connection",
          ],
          verses: [
            {
              chapter: 12,
              verse: 13,
              shloka:
                "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।\nनिर्ममो निरहङ्कारः समदुःखसुखः क्षमी।।",
              translation:
                "One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, who is tolerant...",
              explanation:
                "This verse describes the qualities of a loving and balanced individual.",
              relevance:
                "In relationships, this verse guides you to develop unconditional love without possessiveness, and to maintain emotional balance through ups and downs.",
            },
            {
              chapter: 2,
              verse: 62,
              shloka:
                "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते।।",
              translation:
                "While contemplating the objects of the senses, a person develops attachment for them, and from such attachment lust develops, and from lust anger arises.",
              explanation:
                "This verse explains the process of attachment and how it can lead to suffering.",
              relevance:
                "During breakups or when feeling attached, this verse helps you understand how unhealthy attachment forms and offers a path to emotional freedom.",
            },
          ],
        },
      ];

      await Theme.insertMany(initialThemes);
      console.log("Themes initialized successfully!");
    }
  } catch (error) {
    console.error("Error initializing themes:", error);
  }
}
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
app.get("/api/themes", auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    const intents = chats
      .map((c) => c.intent)
      .filter(Boolean)
      .join(", ");

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

    const aiResponse = await model.generateContent(prompt);
    const text = aiResponse.response.text(); 
    console.log("AI Response:", text);

    
    let jsonOutput = text.trim();
    if (jsonOutput.startsWith("```")) {
      jsonOutput = jsonOutput
        .replace(/^```(?:json)?/, "")
        .replace(/```$/, "")
        .trim();
    }

    let themes;
    try {
      themes = JSON.parse(jsonOutput); 
    } catch (parseErr) {
      throw new Error("Failed to parse JSON from Gemini: " + parseErr.message);
    }

    
    for (const theme of themes) {
      const existingTheme = await Theme.findOne({
        name: { $regex: new RegExp(`^${theme.name}$`, "i") },
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
    // Handle any errors from the AI call or parsing
    console.error("Error generating themes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get verses for a specific theme
app.get("/api/themes/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find theme by name (case insensitive)
    const theme = await Theme.findById(id).select(
      "name description tags verses"
    );

    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }

    // Return theme with its verses
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

    // Find themes with matching tag
    const themes = await Theme.find({
      tags: { $regex: new RegExp(tag, "i") },
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

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: id, userId: req.user.userId }, 
      { isFavorite: isFavorite }, // update isFavorite field
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

    // Find and update theme
    const updatedTheme = await Theme.findByIdAndUpdate(
      id,
      { userId: req.user.userId },
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
    if (chat.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to chat" });
    }
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
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

// Test Route
app.get("/test", (req, res) => {
  res.send("Server is running!");
});
app.get("/api/debug/chats", async (req, res) => {
  const chats = await Chat.find().sort({ _id: -1 }).limit(5);
  res.json(chats);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await initializeThemes();
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
app.put("/api/chats/:id",auth, async (req, res) => {
  const { userMessage, botResponse, hindiResponse, shloka, translation, chapter, verse } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.id,
      {
        userMessage,
        botResponse,
        hindiResponse,
        shloka,
        translation,
        chapter,
        verse,
        updatedAt: new Date(),
      },
      { new: true }
    );
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Failed to update chat", error });
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
    });

    res.json(result);
  } catch (err) {
    console.error("Error generating chat:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});
app.use('/api/notifications', notificationRoutes);
// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  scheduler.stop();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  scheduler.stop();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
