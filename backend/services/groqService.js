const Groq = require("groq-sdk");

class GroqService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = "llama-3.3-70b-versatile"; // High quality model for spiritual content
    
    // Regex patterns for response validation and parsing
    this.patterns = {
      verse: /\*\*Verse:\*\*\s*(\d+)\.(\d+)/i,
      sanskrit: /\*\*Sanskrit:\*\*\s*(.+?)(?=\*\*|$)/s,
      translation: /\*\*Translation:\*\*\s*(.+?)(?=\*\*|$)/s,
      wisdom: /\*\*(?:Today's Wisdom|Daily Reflection|Practical Guidance):\*\*\s*(.+?)(?=\*\*|$)/s,
      challenge: /\*\*Today's Challenge:\*\*\s*(.+?)(?=\*\*|$)/s,
      personalMessage: /\*\*Personal Message:\*\*\s*(.+?)(?=\*\*|$)/s,
      
      // Validation patterns
      validChapter: /^([1-9]|1[0-8])$/,
      validVerse: /^\d+$/,
      hasSanskrit: /[\u0900-\u097F]+/,
      hasMinimumLength: /.{50,}/
    };
  }

  // Helper method to call GROQ API
  async generateContent(prompt) {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a wise spiritual guide with complete knowledge of the Bhagavad Gita. Provide accurate, authentic Sanskrit verses and meaningful wisdom."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: this.model,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });
    
    return completion.choices[0]?.message?.content || "";
  }

  // Updated method to accept user for sequential quotes
  async getDailyQuote(language = "english", quoteType = "random", user = null) {
    try {
      // For true randomness, use database approach occasionally
      if (quoteType === "random" && Math.random() < 0.3) {
        const dbVerse = this.getRandomQuoteFromDatabase();
        const translation = language === "hindi" ? dbVerse.hindi : dbVerse.english;
        
        const formattedQuote =
          `🕉️ Verse: ${dbVerse.reference}\n` +
          `📜 Sanskrit:\n${dbVerse.sanskrit}\n\n` +
          `💬 Translation:\n${translation}\n\n` +
          `🧘 Today's Wisdom:\nThis verse reminds us of the eternal truths that guide our daily lives. Apply this wisdom to find peace and purpose in your actions.`;

        return {
          success: true,
          quote: formattedQuote,
          parsed: {
            verse: dbVerse.reference,
            sanskrit: dbVerse.sanskrit,
            translation: translation,
            wisdom: "This verse reminds us of the eternal truths that guide our daily lives. Apply this wisdom to find peace and purpose in your actions."
          },
          timestamp: new Date(),
          type: quoteType,
          language: language,
          source: "database"
        };
      }

      const prompts = {
        random: this.getRandomQuotePrompt(language),
        sequential: this.getSequentialQuotePrompt(language, user),
        themed: this.getThemedQuotePrompt(language)
      };

      const prompt = prompts[quoteType] || prompts.random;
      const rawText = await this.generateContent(prompt);
      
      const parsedQuote = this.parseQuoteResponse(rawText, quoteType);
      console.log("Parsed Quote:", parsedQuote);
      
      if (!rawText || rawText.trim().length < 50) {
        console.warn("Response too short or empty, using fallback");
        return this.getFallbackQuote();
      }
      
      const hasBasicContent = parsedQuote.verse || parsedQuote.sanskrit || parsedQuote.translation || rawText.includes('Verse:');
      
      if (!hasBasicContent) {
        console.warn("No meaningful content found, using fallback");
        return this.getFallbackQuote();
      }
      
      return {
        success: true,
        quote: this.cleanFormattedText(rawText),
        parsed: parsedQuote,
        timestamp: new Date(),
        type: quoteType,
        language: language,
        userProgress: user && quoteType === 'sequential' ? {
          chapter: user.sequentialProgress.currentChapter,
          verse: user.sequentialProgress.currentVerse
        } : null
      };
    } catch (error) {
      console.error("GROQ API Error:", error);
      return this.getFallbackQuote();
    }
  }

  // Method to advance user's sequential progress
  async advanceUserSequentialVerse(user) {
    const verseCounts = {
      1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 
      9: 34, 10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 
      16: 24, 17: 28, 18: 78
    };

    const currentChapter = user.sequentialProgress.currentChapter;
    const currentVerse = user.sequentialProgress.currentVerse;
    
    let newChapter = currentChapter;
    let newVerse = currentVerse + 1;
    
    if (newVerse > (verseCounts[currentChapter] || 50)) {
      if (!user.sequentialProgress.completedChapters.includes(currentChapter)) {
        user.sequentialProgress.completedChapters.push(currentChapter);
      }
      
      newChapter = currentChapter + 1;
      newVerse = 1;
      
      if (newChapter > 18) {
        newChapter = 1; 
        newVerse = 1;
      }
    }

    user.sequentialProgress.currentChapter = newChapter;
    user.sequentialProgress.currentVerse = newVerse;
    user.sequentialProgress.totalVersesRead += 1;
    user.sequentialProgress.lastUpdated = new Date();
    
    await user.save();
    
    return {
      chapter: newChapter,
      verse: newVerse,
      position: `${newChapter}.${newVerse}`,
      totalRead: user.sequentialProgress.totalVersesRead,
      completedChapters: user.sequentialProgress.completedChapters.length
    };
  }

  getRandomQuoteFromDatabase() {
    const verseDatabase = [
      {
        reference: "2.20",
        sanskrit: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥",
        english: "The soul is never born, nor does it die. It is not slain when the body is slain.",
        hindi: "आत्मा न तो जन्म लेती है और न ही मरती है। शरीर के नष्ट होने पर आत्मा नष्ट नहीं होती।"
      },
      {
        reference: "2.47",
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        english: "You have the right to perform your actions, but you are not entitled to the fruits of action.",
        hindi: "तुम्हें केवल कर्म करने का अधिकार है, फल की इच्छा मत करो।"
      },
      {
        reference: "6.5",
        sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
        english: "One should lift oneself by one's own efforts and not degrade oneself. The mind alone is one's friend as well as one's enemy.",
        hindi: "मनुष्य को अपने द्वारा अपना उद्धार करना चाहिए। मन ही मनुष्य का मित्र है और मन ही शत्रु है।"
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * verseDatabase.length);
    return verseDatabase[randomIndex];
  }

  cleanFormattedText(text) {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  getRandomQuotePrompt(language) {
    return `You are a spiritual guide sharing wisdom from the Bhagavad Gita. Generate a meaningful daily quote.

EXACT OUTPUT FORMAT:
**Verse:** [Chapter.Verse number]
**Sanskrit:** [Authentic Sanskrit verse in Devanagari script]
**Translation:** [Clear translation in ${language}]
**Today's Wisdom:** [2-3 sentences of practical guidance]

Generate a quote now:`;
  }

  getSequentialQuotePrompt(language, user) {
    const currentChapter = user?.sequentialProgress?.currentChapter || 1;
    const currentVerse = user?.sequentialProgress?.currentVerse || 1;
    
    return `Provide the sequential verse from Bhagavad Gita.

CURRENT POSITION: Chapter ${currentChapter}, Verse ${currentVerse}

EXACT OUTPUT FORMAT:
**Verse:** ${currentChapter}.${currentVerse}
**Sanskrit:** [Exact Sanskrit text in Devanagari]
**Translation:** [Translation in ${language}]
**Daily Reflection:** [Comprehensive reflection]

Generate the verse now:`;
  }

  getThemedQuotePrompt(language) {
    const themes = ["stress management", "finding purpose", "inner peace", "dealing with challenges"];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    return `Provide Bhagavad Gita wisdom for: ${randomTheme}

EXACT OUTPUT FORMAT:
**Today's Challenge:** ${randomTheme}
**Verse:** [Relevant Chapter.Verse]
**Sanskrit:** [Sanskrit in Devanagari]
**Translation:** [Translation in ${language}]
**Practical Guidance:** [Specific guidance]

Generate now:`;
  }

  parseQuoteResponse(responseText, quoteType) {
    const parsed = {
      verse: this.extractMatch(responseText, this.patterns.verse, 0),
      chapter: this.extractMatch(responseText, this.patterns.verse, 1),
      verseNumber: this.extractMatch(responseText, this.patterns.verse, 2),
      sanskrit: this.extractMatch(responseText, this.patterns.sanskrit, 1),
      translation: this.extractMatch(responseText, this.patterns.translation, 1),
      wisdom: this.extractMatch(responseText, this.patterns.wisdom, 1)
    };

    Object.keys(parsed).forEach(key => {
      if (parsed[key]) {
        parsed[key] = parsed[key].trim().replace(/\*\*/g, '').replace(/\n+/g, ' ');
      }
    });

    return parsed;
  }

  extractMatch(text, pattern, groupIndex) {
    const match = text.match(pattern);
    if (match && match[groupIndex] !== undefined) {
      return groupIndex === 0 ? match[0] : match[groupIndex];
    }
    return null;
  }

  validateQuoteResponse(parsedQuote) {
    const hasTranslation = parsedQuote.translation && parsedQuote.translation.length > 10;
    const hasWisdom = parsedQuote.wisdom && parsedQuote.wisdom.length > 10;
    return hasTranslation || hasWisdom;
  }

  getFallbackQuote() {
    const fallbackQuotes = [
      {
        verse: "2.47",
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        translation: "You have the right to perform your actions, but you are not entitled to the fruits of action.",
        wisdom: "Focus on your efforts without being attached to outcomes. This brings peace and freedom."
      }
    ];

    const randomQuote = fallbackQuotes[0];
    const formattedQuote =
      `🕉️ Verse: ${randomQuote.verse}\n` +
      `📜 Sanskrit:\n${randomQuote.sanskrit}\n\n` +
      `💬 Translation:\n${randomQuote.translation}\n\n` +
      `🧘 Today's Wisdom:\n${randomQuote.wisdom}`;
    
    return {
      success: false,
      quote: formattedQuote,
      parsed: randomQuote,
      fallback: true,
      timestamp: new Date()
    };
  }

  // Test API endpoint to verify GROQ service is working
  async testApi() {
    try {
      const testPrompt = "Say 'Hello from GROQ API' in a friendly way.";
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: testPrompt
          }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 100,
        top_p: 1,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || "";

      return {
        success: true,
        message: "GROQ API is working correctly",
        testResponse: response,
        model: this.model,
        timestamp: new Date(),
        apiKeyConfigured: !!process.env.GROQ_API_KEY
      };
    } catch (error) {
      console.error("GROQ Test API Error:", error);
      return {
        success: false,
        message: "GROQ API test failed",
        error: error.message,
        timestamp: new Date(),
        apiKeyConfigured: !!process.env.GROQ_API_KEY
      };
    }
  }
}

module.exports = new GroqService();
