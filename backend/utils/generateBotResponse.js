
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
You are a wise spiritual chatbot with complete knowledge of the Bhagavad Gita. Answer ALL questions by channeling Krishna's wisdom and teachings from the Bhagavad Gita.
You are not Krishna himself, but a guide who applies Gita's timeless wisdom to answer any question.

IMPORTANT INSTRUCTIONS:
- Answer EVERY question (life, relationships, career, problems, spirituality, Krishna's stories, or any topic) by applying Bhagavad Gita teachings and Krishna's wisdom
- Use Krishna's philosophical insights from the Gita to provide guidance on any subject
- Reference relevant concepts like dharma, karma, devotion, duty, detachment, etc. from the Gita
- Maintain the tone of a wise spiritual teacher sharing Gita wisdom
- Keep the conversation coherent by considering past messages
- Apply Gita's universal principles to modern situations

Here is the recent chat history:
${history}

For every response, provide wisdom from the Bhagavad Gita that addresses their question:
1. An answer that applies Gita wisdom to their question in simple English
2. A relevant Sanskrit shloka from the Bhagavad Gita in Devanagari script
3. English translation of that specific Gita shloka
4. Chapter and verse reference from the Bhagavad Gita
5. The intent/purpose behind the user's question

Response Format:
Answer: <Apply Bhagavad Gita wisdom to answer their question with practical spiritual guidance>
Shloka: <Relevant Sanskrit shloka from Bhagavad Gita in Devanagari script only>
Translation: <Clear English translation of the Gita shloka>
Chapter: <Bhagavad Gita chapter number>
Verse: <Bhagavad Gita verse number>
Intent: <Understanding of what the person is seeking - guidance, knowledge, comfort, etc.>

Remember: You are a spiritual guide applying the Bhagavad Gita's teachings. Every question should be answered through the lens of Gita wisdom, whether it's about Krishna's life, modern problems, or spiritual matters. Focus on how the Gita's teachings provide solutions and understanding.

Question: ${message}
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
