require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const corsOptions = {
  origin: true,         // Reflect request origin, allowing requests from anywhere
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Chat Schema & Model
const chatSchema = new mongoose.Schema({
  userMessage: String,
  botResponse: String,
  hindiResponse: String, // Field for Hindi responses
  shloka: String,
  translation: String,
  chapter: String,
  verse: String,
  createdAt: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false }
});

const Chat = mongoose.model("Chat", chatSchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Handle User Queries
app.post("/api/message", async (req, res) => {
  try {
    console.log("Received message request:", req.body);
    const { message, chatHistory } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Use provided chat history if available, otherwise fetch from DB
    let history;
    try {
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        history = chatHistory
          .map((chat) => `User: ${chat.userMessage}\nBot: ${chat.botResponse}`)
          .join("\n");
      } else {
        // Fetch recent chat history (last 5 messages for context)
        const recentChats = await Chat.find().sort({ createdAt: -1 }).limit(5);
        history = recentChats
          .map((chat) => `User: ${chat.userMessage}\nBot: ${chat.botResponse}`)
          .join("\n");
      }
    } catch (historyError) {
      console.error("Error processing chat history:", historyError);
      history = ""; // If there's an error, proceed with empty history
    }

    // Construct the AI prompt
    const prompt = `
    You are an expert in the Bhagavad Gita. Keep the conversation coherent by considering past messages.

    Here is the recent chat history:
    ${history}

    Now, answer the following in simple English with a relevant Sanskrit shloka in Sanskrit script.
    Also include the English translation of the shloka separately.
    Also include which chapter and verse the shloka is from (e.g., Chapter 2, Verse 47).

    The format should be:
    Answer: <Your answer>
    Shloka: <Relevant Sanskrit shloka in Devanagari script only>
    Translation: <English translation of the shloka>
    Chapter: <chapter number>
    Verse: <verse number>

    Question: ${message}
    `;
    
    // Get AI Response
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log("Raw AI Response:", response);

    // Extract Answer, Shloka, Translation, Chapter & Verse Properly
    const answerMatch = response.match(/Answer:\s*(.*?)\s*Shloka:/s);
    const shlokaMatch = response.match(/Shloka:\s*(.*?)(?:\s*Translation:|$)/s);
    const translationMatch = response.match(/Translation:\s*(.*?)(?:\s*Chapter:|$)/s);
    const chapterMatch = response.match(/Chapter:\s*(\d+)/);
    const verseMatch = response.match(/Verse:\s*(\d+)/);

    const answer = answerMatch ? answerMatch[1].trim() : "Answer not found";
    const shloka = shlokaMatch ? shlokaMatch[1].trim() : "Shloka not found";
    const translation = translationMatch ? translationMatch[1].trim() : "Translation not found";
    const chapter = chapterMatch ? chapterMatch[1].trim() : "";
    const verse = verseMatch ? verseMatch[1].trim() : "";
    
    // Get Hindi translation
    const hindiResponse = await translateToHindi(answer);
    
    // Save chat to database - now including hindiResponse
    const chat = new Chat({ 
      userMessage: message, 
      botResponse: answer,
      hindiResponse: hindiResponse, // Save Hindi translation
      shloka: shloka,
      translation: translation,
      chapter,
      verse,
      isFavorite: false
    });
    await chat.save();

    // Send response with both English and Hindi
    res.json({ 
      botResponse: answer,
      hindiResponse: hindiResponse,
      shloka: shloka,
      translation: translation,
      chapter, 
      verse,
      _id: chat._id,
      isFavorite: false
    });

  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Hindi translation function
async function translateToHindi(englishText) {
  try {
    // Using Google Generative AI model for translation instead of external API
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

// Get Recent Chats
app.get("/api/chats", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(50);
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// Enhanced delete endpoint with improved error handling
app.delete("/api/chats/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid chat ID format" });
    }
    
    // Find and delete the chat by ID
    const deletedChat = await Chat.findByIdAndDelete(id);
    
    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found with this ID" });
    }
    
    // Return success response with the deleted chat info
    return res.json({ 
      success: true, 
      message: "Chat deleted successfully",
      deletedChat: {
        _id: deletedChat._id,
        userMessage: deletedChat.userMessage,
        createdAt: deletedChat.createdAt
      }
    });
  } catch (error) {
    console.error("Error deleting chat by ID:", error);
    return res.status(500).json({ error: "Failed to delete chat" });
  }
});

// Keep the original index-based delete method as a fallback
app.delete("/api/chats/index/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ error: "Invalid chat index" });
    }
    
    // Get all chats in order without a limit to ensure we have all chats
    const chats = await Chat.find().sort({ createdAt: -1 });
    
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
        createdAt: chatToDelete.createdAt
      }
    });
  } catch (error) {
    console.error("Error deleting chat by index:", error);
    return res.status(500).json({ error: "Failed to delete chat by index" });
  }
});

// Toggle Favorite Status
app.put("/api/chats/:id/favorite", async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { isFavorite: isFavorite },
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

// Get Favorite Chats
app.get("/api/favorites", async (req, res) => {
  try {
    const favorites = await Chat.find({ isFavorite: true }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Share Chat - Updated to include Hindi translation option
app.get("/api/share/:chatId", async (req, res) => {
  console.log("Received share request for chatId:", req.params.chatId);
  try {
    const { chatId } = req.params;
    const { language = 'english' } = req.query;

    console.log("➡️ Request for chatId:", chatId);

    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log("❌ Chat not found");
      return res.status(404).json({ error: "Chat not found" });
    }

    console.log("✅ Chat found:", chat);

    let responseText = language.toLowerCase() === 'hindi' && chat.hindiResponse 
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


// Modified endpoint to get response in a specific language
app.get("/api/chats/:id/language/:language", async (req, res) => {
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
    
    // Return the response in the requested language
    if (language.toLowerCase() === 'hindi') {
      // If Hindi translation doesn't exist yet, create it
      if (!chat.hindiResponse) {
        chat.hindiResponse = await translateToHindi(chat.botResponse);
        await chat.save();
      }
      return res.json({ 
        response: chat.hindiResponse || "Hindi translation not available",
        _id: chat._id
      });
    } else {
      return res.json({ 
        response: chat.botResponse,
        _id: chat._id
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
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));


// Sidebar Navigation Endpoint - Get Chat Titles
app.get("/api/sidebar", async (req, res) => {
  try {
    // Fetch only the necessary fields for sidebar navigation
    const sidebarItems = await Chat.find({})
      .select('_id userMessage createdAt isFavorite')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform data for sidebar - include truncated message as title
    const formattedItems = sidebarItems.map(chat => {
      // Create a truncated title with proper null/undefined checks
      let title = "Untitled";
      if (chat.userMessage) {
        title = chat.userMessage.length > 30 
          ? `${chat.userMessage.substring(0, 30)}...` 
          : chat.userMessage;
      }
      
      // Ensure _id is properly converted to string to avoid serialization issues
      return {
        _id: chat._id.toString(),  // Use _id consistently - this matches your other endpoints
        id: chat._id.toString(),   // Include id for frontend compatibility
        title: title,
        timestamp: chat.createdAt,
        isFavorite: Boolean(chat.isFavorite)  // Ensure boolean type
      };
    });
    
    // Return a proper JSON response
    return res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Error fetching sidebar data:", error);
    return res.status(500).json({ error: "Failed to fetch sidebar navigation data" });
  }
});
