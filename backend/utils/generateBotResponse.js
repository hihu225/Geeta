
const generateBotResponse = async ({ message, chatHistory, model, translateToHindi, Theme, generateKrishnaAdvice }) => {
  // 1. Check for theme queries
    const themeMatch = message.match(
      /theme(?:s)?\s+(?:about|on|for|of)?\s+(.+?)(?:\?|$|\s)/i
    );
    if (themeMatch) {
      const themeQuery = themeMatch[1].trim();
      try {
        const theme = await Theme.findOne({
          $or: [
            { name: { $regex: new RegExp(themeQuery, "i") } },
            { tags: { $regex: new RegExp(themeQuery, "i") } },
          ],
        });

        if (theme) {
          const randomVerseIndex = Math.floor(
            Math.random() * theme.verses.length
          );
          const verse = theme.verses[randomVerseIndex];
          const krishnaAdvice = generateKrishnaAdvice(theme);
          const answer = `Theme: ${theme.name}\n\n${theme.description}\n\nKrishna's Advice: ${krishnaAdvice}\n\nWhy this verse: ${verse.relevance}`;

          const hindiResponse = await translateToHindi(answer);
          const chat = new Chat({
            userMessage: message,
            botResponse: answer,
            hindiResponse,
            shloka: verse.shloka,
            translation: verse.translation,
            chapter: verse.chapter.toString(),
            verse: verse.verse.toString(),
            isFavorite: false,
            userId: req.user.userId,
          });
          await chat.save();

          return res.json({
            botResponse: answer,
            hindiResponse,
            shloka: verse.shloka,
            translation: verse.translation,
            chapter: verse.chapter.toString(),
            verse: verse.verse.toString(),
            _id: chat._id,
            isFavorite: false,
            themeData: {
              name: theme.name,
              description: theme.description,
              verse: verse,
            },
          });
        }
      } catch (themeError) {
        console.error("Error processing theme query:", themeError);
        // Proceed to normal AI response fallback
      }
    }

    // 2. Prepare chat history for prompt (whether from client or DB)
    let history = "";
    try {
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        history = chatHistory
          .map((chat) => `User: ${chat.userMessage}\nBot: ${chat.botResponse}`)
          .join("\n");
      } else {
        const recentChats = await Chat.find().sort({ createdAt: -1 }).limit(5);
        history = recentChats
          .map((chat) => `User: ${chat.userMessage}\nBot: ${chat.botResponse}`)
          .join("\n");
      }
    } catch (historyError) {
      console.error("Error processing chat history:", historyError);
      history = "";
    }

    // 3. Build prompt and call AI
    const prompt = `
You are a wise spiritual chatbot with complete knowledge of the Bhagavad Gita. You are not Krishna himself, but a guide who applies Krishna's teachings and the Gita’s timeless wisdom to help people with any question—whether it's about life, relationships, career, mental peace, problems, or spirituality.

🛑 IMPORTANT: Do not refer to the user as Arjuna. The wisdom should apply to any modern seeker. Avoid historical role-play or addressing the user as a specific character. Use general, universal spiritual tone.

🎯 Instructions:

Apply the core messages of the Gita (like dharma, karma, bhakti, detachment, inner peace, etc.) to modern real-life situations

Never act as if in a battlefield or ancient scene—respond as a modern guide

Keep responses coherent with previous history:
${history}

Provide responses in the following exact format:

Answer: <Apply Bhagavad Gita wisdom in clear, simple English to address the question with practical guidance>
Shloka: <Sanskrit verse in Devanagari script>
Translation: <Plain English translation of the verse>
Chapter: <Chapter number>
Verse: <Verse number>
Intent: <What is the user really seeking? Guidance, clarity, emotional peace, etc.>

Question:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log("Raw AI Response:", response);

    // Extract parts
    const answerMatch = response.match(/Answer:\s*(.*?)\s*Shloka:/s);
    const shlokaMatch = response.match(/Shloka:\s*(.*?)(?:\s*Translation:|$)/s);
    const translationMatch = response.match(
      /Translation:\s*(.*?)(?:\s*Chapter:|$)/s
    );
    const chapterMatch = response.match(/Chapter:\s*(\d+)/);
    const verseMatch = response.match(/Verse:\s*(\d+)/);
    const intentMatch = response.match(/Intent:\s*(.*?)(?:\s*$)/);
    const intent = intentMatch ? intentMatch[1].trim() : "Intent not found";
    const answer = answerMatch ? answerMatch[1].trim() : "Answer not found";
    const shloka = shlokaMatch ? shlokaMatch[1].trim() : "Shloka not found";
    const translation = translationMatch
      ? translationMatch[1].trim()
      : "Translation not found";
    const chapter = chapterMatch ? chapterMatch[1].trim() : "";
    const verse = verseMatch ? verseMatch[1].trim() : "";

    // Hindi translation
    const hindiResponse = await translateToHindi(answer);
  return {
    botResponse: answer,
    hindiResponse,
    shloka,
    translation,
    chapter,
    verse,
    intent,
    isFavorite: false,
  };
};

module.exports = generateBotResponse;
