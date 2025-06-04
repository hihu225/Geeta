// backend/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Track sequential verse progression
    this.currentChapter = 1;
    this.currentVerse = 1;
    
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

  async getDailyQuote(language = "english", quoteType = "random") {
  try {
    // For true randomness, use database approach occasionally
    if (quoteType === "random" && Math.random() < 0.3) {
      const dbVerse = this.getRandomQuoteFromDatabase();
      const translation = language === "hindi" ? dbVerse.hindi : dbVerse.english;
      
      const formattedQuote = `Verse: ${dbVerse.reference}
Sanskrit: ${dbVerse.sanskrit}
Translation: ${translation}
Today's Wisdom: This verse reminds us of the eternal truths that guide our daily lives. Apply this wisdom to find peace and purpose in your actions.`;

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
      sequential: this.getSequentialQuotePrompt(language),
      themed: this.getThemedQuotePrompt(language)
    };

    const prompt = prompts[quoteType] || prompts.random;
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    const rawText = response.text();
    console.log("Raw Gemini Response:", rawText);
    
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
      language: language
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return this.getFallbackQuote();
  }
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
      reference: "2.62",
      sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
      english: "While contemplating the objects of the senses, attachment develops. From attachment comes desire, and from desire arises anger.",
      hindi: "विषयों का चिंतन करने से उनमें आसक्ति होती है। आसक्ति से काम और काम से क्रोध उत्पन्न होता है।"
    },
    {
      reference: "4.7",
      sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
      english: "Whenever there is a decline in dharma and rise of adharma, I manifest myself.",
      hindi: "जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं अवतार लेता हूं।"
    },
    {
      reference: "6.5",
      sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
      english: "One should lift oneself by one's own efforts and not degrade oneself. The mind alone is one's friend as well as one's enemy.",
      hindi: "मनुष्य को अपने द्वारा अपना उद्धार करना चाहिए। मन ही मनुष्य का मित्र है और मन ही शत्रु है।"
    },
    {
      reference: "15.7",
      sanskrit: "ममैवांशो जीवलोके जीवभूतः सनातनः। मनःषष्ठानीन्द्रियाणि प्रकृतिस्थानि कर्षति॥",
      english: "The living entities in this world are My eternal fragmental parts, drawing the six senses including the mind from material nature.",
      hindi: "इस संसार में सभी जीव मेरे ही शाश्वत अंश हैं, जो प्रकृति से मन सहित छह इंद्रियों को आकर्षित करते हैं।"
    }
    // can add more verses here
  ];
  
  const randomIndex = Math.floor(Math.random() * verseDatabase.length);
  return verseDatabase[randomIndex];
}


  
  cleanFormattedText(text) {
  return text
    .replace(/\*\*([^*]+):\*\*/g, '**$1:**\n') 
    .replace(/\*([^*]+)\*/g, '$1') 
    .replace(/\n\s*\n\s*\n/g, '\n\n') 
    .trim();
}

  getRandomVerseReference() {
  const verseCounts = {
    1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 
    9: 34, 10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 
    16: 24, 17: 28, 18: 78
  };
  
  // Select random chapter (1-18)
  const randomChapter = Math.floor(Math.random() * 18) + 1;
  
  // Select random verse within that chapter
  const maxVerses = verseCounts[randomChapter];
  const randomVerse = Math.floor(Math.random() * maxVerses) + 1;
  
  return {
    chapter: randomChapter,
    verse: randomVerse,
    reference: `${randomChapter}.${randomVerse}`
  };
}

getRandomQuotePrompt(language) {
  const languageInstructions = this.getLanguageInstructions(language);
  
  // Add randomization seed
  const randomSeed = `RANDOMIZATION SEED: ${Math.random().toString(36).substring(7)} - Use this to select a truly random verse, not commonly quoted ones like 2.47.`;
  
  return `You are a spiritual guide sharing wisdom from the Bhagavad Gita. Generate a meaningful daily quote following this EXACT format:

${randomSeed}

CRITICAL FORMATTING RULES:
- Use EXACTLY these headers with double asterisks: **Verse:**, **Sanskrit:**, **Translation:**, **Today's Wisdom:**
- Each section must be on a new line
- No additional formatting or decorations
- Follow the exact structure shown below

CONTENT REQUIREMENTS:
- Select a DIFFERENT, RANDOM verse from chapters 1-18 of the Bhagavad Gita (avoid repeating 2.47)
- Provide authentic Sanskrit text (use proper Devanagari script)
- Give accurate translation in ${language}
- Offer practical wisdom for modern daily challenges

LANGUAGE: ${languageInstructions.primary}

EXACT OUTPUT FORMAT (follow precisely):
**Verse:** [Chapter.Verse number, e.g., 3.21, 7.14, 12.13 - pick randomly]
**Sanskrit:** [Authentic Sanskrit verse in Devanagari script]
**Translation:** [Clear, inspiring translation in ${language}]
**Today's Wisdom:** [2-3 concise sentences offering practical guidance for applying this verse in daily life, addressing modern challenges like stress, relationships, work, or personal growth]

${languageInstructions.additional}

QUALITY CHECKS:
- Verse must exist in the actual Bhagavad Gita
- Must be DIFFERENT from previous responses (especially not 2.47)
- Sanskrit must be authentic and properly formatted
- Translation must be accurate and beautiful
- Wisdom must be practical and actionable
- Response must follow the exact format specified

Generate a RANDOM quote now:`;
}

  getSequentialQuotePrompt(language) {
    const languageInstructions = this.getLanguageInstructions(language);
    
    return `You are providing sequential verses from the Bhagavad Gita for systematic daily study.

CURRENT POSITION: Chapter ${this.currentChapter}, Verse ${this.currentVerse}

CRITICAL FORMATTING RULES:
- Use EXACTLY these headers: **Verse:**, **Sanskrit:**, **Translation:**, **Daily Reflection:**
- Each section must be on a new line
- Provide the EXACT verse requested, not a random one
- Follow the precise structure below

LANGUAGE: ${languageInstructions.primary}

EXACT OUTPUT FORMAT:
**Verse:** ${this.currentChapter}.${this.currentVerse}
**Sanskrit:** [Exact Sanskrit text for Chapter ${this.currentChapter}, Verse ${this.currentVerse} in Devanagari]
**Translation:** [Accurate translation in ${language}]
**Daily Reflection:** [Comprehensive reflection with three parts:

1. Context: Situational context within the chapter (2-3 sentences)
2. Spiritual Meaning: Deeper philosophical significance (2-3 sentences)  
3. Practical Application: Actionable advice for daily life (2-3 sentences)]

${languageInstructions.additional}

QUALITY REQUIREMENTS:
- Must be the exact verse requested (${this.currentChapter}.${this.currentVerse})
- Sanskrit must be authentic and properly formatted
- Translation must be accurate and flowing
- Reflection must connect to the overall flow of Krishna's teachings
- Each reflection part must be clearly structured and meaningful

Generate the sequential verse now:`;
  }

  getThemedQuotePrompt(language) {
    const languageInstructions = this.getLanguageInstructions(language);
    const todayThemes = [
      "overcoming stress and anxiety",
      "finding purpose in work", 
      "building healthy relationships",
      "developing inner peace",
      "dealing with difficult people",
      "making important decisions",
      "finding motivation and energy",
      "balancing material and spiritual life",
      "developing patience and tolerance",
      "cultivating gratitude and contentment",
      "managing anger and frustration",
      "finding strength in adversity",
      "developing self-discipline",
      "overcoming fear and doubt",
      "cultivating compassion and kindness"
    ];
    
    const randomTheme = todayThemes[Math.floor(Math.random() * todayThemes.length)];
    
    return `You are a wise spiritual counselor. Someone is struggling with: ${randomTheme}

CRITICAL FORMATTING RULES:
- Use EXACTLY these headers: **Today's Challenge:**, **Verse:**, **Sanskrit:**, **Translation:**, **Practical Guidance:**
- Each section must be on a new line
- Choose a verse that directly addresses this challenge
- Make guidance specific and actionable

LANGUAGE: ${languageInstructions.primary}

EXACT OUTPUT FORMAT:
**Today's Challenge:** ${randomTheme}
**Verse:** [Chapter.Verse that directly addresses this challenge]
**Sanskrit:** [Authentic Sanskrit text in Devanagari]
**Translation:** [Clear, comforting translation in ${language}]
**Practical Guidance:** [Structured guidance with four parts:

1. Relevance: Why this verse is perfect for today's challenge (1-2 sentences)
2. Action Steps: Specific, practical steps to apply the wisdom (2-3 concrete steps)
3. Expected Benefits: Positive changes to expect from following this guidance (1-2 sentences)
4. Affirmation: Uplifting reminder to inspire hope and perseverance (1 sentence)]

${languageInstructions.additional}

QUALITY REQUIREMENTS:
- Verse must directly relate to the specific challenge
- Sanskrit must be authentic with proper formatting
- Translation must be comforting and relevant
- Guidance must be specific, not generic
- Tone must be compassionate and encouraging

Generate the themed quote now:`;
  }

  getLanguageInstructions(language) {
    const instructions = {
      english: {
        primary: "Provide all translations and wisdom in clear, beautiful English",
        additional: "Use inspiring, accessible language that resonates with modern English speakers. Avoid archaic terms."
      },
      hindi: {
        primary: "सभी अनुवाद और ज्ञान सुंदर हिंदी में प्रदान करें",
        additional: "आधुनिक हिंदी भाषियों के लिए प्रेरणादायक और सुलभ भाषा का उपयोग करें। कठिन शब्दों से बचें।"
      },
      sanskrit: {
        primary: "Provide detailed Sanskrit commentary and explanation",
        additional: "Include word-by-word meaning and grammatical insights for Sanskrit students. Use proper Devanagari script."
      },
      gujarati: {
        primary: "બધા અનુવાદ અને જ્ઞાન સુંદર ગુજરાતીમાં આપો",
        additional: "આધુનિક ગુજરાતી ભાષીઓ માટે પ્રેરણાદાયક અને સુલભ ભાષાનો ઉપયોગ કરો. કઠિન શબ્દોથી બચો."
      },
      tamil: {
        primary: "அனைத்து மொழிபெயர்ப்பு மற்றும் ஞானத்தையும் அழகான தமிழில் வழங்கவும்",
        additional: "நவீன தமிழ் பேசுபவர்களுக்கு ஊக்கமளிக்கும் மற்றும் அணுகக்கூடிய மொழியைப் பயன்படுத்தவும். கடினமான சொற்களைத் தவிர்க்கவும்."
      }
    };

    return instructions[language.toLowerCase()] || instructions.english;
  }

  async getPersonalizedQuote(userContext) {
    try {
      const prompt = `You are a wise spiritual mentor with deep knowledge of the Bhagavad Gita. A person needs personalized guidance.

USER'S SITUATION: ${userContext}

CRITICAL FORMATTING RULES:
- Use EXACTLY these headers: **Your Situation:**, **Krishna's Guidance:**, **Verse:**, **Sanskrit:**, **Translation:**, **Personal Message:**
- Each section must be on a new line
- Choose the most relevant verse for their specific situation
- Make the message deeply personal and specific

EXACT OUTPUT FORMAT:
**Your Situation:** [Acknowledge their situation with empathy and understanding in 1-2 sentences]
**Krishna's Guidance:** [Explain why this specific verse is perfect for their situation in 2-3 sentences]
**Verse:** [Chapter.Verse most relevant to their challenge]
**Sanskrit:** [Authentic Sanskrit text in Devanagari]
**Translation:** [Clear, meaningful English translation that relates to their circumstances]
**Personal Message:** [Personalized guidance in 4-5 sentences that:
- Addresses their unique challenges directly
- Suggests specific, actionable steps they can take
- Provides encouragement and hope
- Reminds them of their inner strength and divine nature]

QUALITY REQUIREMENTS:
- Must be deeply personal, not generic
- Verse must directly relate to their specific challenge
- Sanskrit must be authentic and properly formatted
- Message must be warm, understanding, and actionable
- Avoid clichés and generic spiritual advice

Generate the personalized quote now:`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      const parsedQuote = this.parsePersonalizedResponse(rawText);
      
      return {
        success: true,
        quote: this.cleanFormattedText(rawText), // Clean the raw text
        parsed: parsedQuote,
        personalized: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Personalized quote error:", error);
      return this.getDailyQuote(); // Fallback to regular quote
    }
  }

  async getWisdomForSituation(situation, emotionalState = "neutral") {
    try {
      const prompt = `A person is experiencing: "${situation}" and feeling ${emotionalState}.

CRITICAL FORMATTING RULES:
- Use EXACTLY these headers: **Situation:**, **Verse:**, **Sanskrit:**, **Translation:**, **Wisdom for You:**, **Gentle Reminder:**
- Each section must be on a new line
- Choose a verse that addresses both their situation AND emotional state
- Be compassionate and practical

EXACT OUTPUT FORMAT:
**Situation:** ${situation} (feeling ${emotionalState})
**Verse:** [Chapter.Verse that directly addresses their situation and emotional state]
**Sanskrit:** [Authentic Sanskrit text in Devanagari]
**Translation:** [English translation that resonates with their emotional state]
**Wisdom for You:** [Specific guidance for their situation and emotional state in 3-4 sentences]
**Gentle Reminder:** [One inspiring, uplifting sentence to comfort and motivate them]

QUALITY REQUIREMENTS:
- Verse must address both situation and emotional state
- Sanskrit must be authentic and properly formatted
- Guidance must be specific to their circumstances
- Tone must be compassionate and understanding
- Reminder must be genuinely uplifting

Generate the situational wisdom now:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      const parsedQuote = this.parseSituationalResponse(rawText);
      
      return {
        success: true,
        quote: this.cleanFormattedText(rawText), // Clean the raw text
        parsed: parsedQuote,
        situational: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Situational wisdom error:", error);
      return this.getFallbackQuote();
    }
  }

  async getThematicQuote(theme) {
    const themePrompts = {
      morning: "starting the day with purpose and divine energy",
      evening: "reflecting on the day and finding inner peace",
      work: "approaching duties with the right attitude and devotion",
      relationships: "dealing with interpersonal challenges with wisdom",
      decision: "making important life choices with divine guidance",
      stress: "managing pressure and maintaining inner calm",
      growth: "personal development and spiritual evolution",
      leadership: "leading with wisdom and compassion",
      service: "serving others with a pure heart",
      meditation: "deepening spiritual practice and inner awareness"
    };

    const themeDescription = themePrompts[theme] || "general life guidance";
    
    try {
      const prompt = `Provide Bhagavad Gita wisdom specifically for: ${themeDescription}

CRITICAL FORMATTING RULES:
- Use EXACTLY these headers: **Theme:**, **Verse:**, **Sanskrit:**, **Translation:**, **Application:**, **Affirmation:**
- Each section must be on a new line
- Select the most relevant verse for this specific theme
- Make application practical and specific

EXACT OUTPUT FORMAT:
**Theme:** ${themeDescription}
**Verse:** [Most relevant Chapter.Verse for this theme]
**Sanskrit:** [Authentic Sanskrit text in Devanagari]
**Translation:** [Clear English translation that relates to the theme]
**Application:** [How to apply this wisdom to ${themeDescription} in 3-4 practical sentences]
**Affirmation:** [A positive, empowering statement based on this teaching]

QUALITY REQUIREMENTS:
- Verse must directly relate to the theme
- Sanskrit must be authentic and properly formatted
- Application must be specific and actionable
- Affirmation must be inspiring and relevant

Generate the thematic quote now:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      const parsedQuote = this.parseThematicResponse(rawText);
      
      return {
        success: true,
        quote: this.cleanFormattedText(rawText), // Clean the raw text
        parsed: parsedQuote,
        theme: theme,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Thematic quote error:", error);
      return this.getFallbackQuote();
    }
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

    // Clean up extracted text
    Object.keys(parsed).forEach(key => {
      if (parsed[key]) {
        parsed[key] = parsed[key].trim().replace(/\*\*/g, '').replace(/\n+/g, ' ');
      }
    });

    return parsed;
  }

  parsePersonalizedResponse(responseText) {
    const parsed = {
      situation: this.extractMatch(responseText, /\*\*Your Situation:\*\*\s*(.+?)(?=\*\*|$)/s, 1),
      guidance: this.extractMatch(responseText, /\*\*Krishna's Guidance:\*\*\s*(.+?)(?=\*\*|$)/s, 1),
      verse: this.extractMatch(responseText, this.patterns.verse, 0),
      sanskrit: this.extractMatch(responseText, this.patterns.sanskrit, 1),
      translation: this.extractMatch(responseText, this.patterns.translation, 1),
      personalMessage: this.extractMatch(responseText, this.patterns.personalMessage, 1)
    };

    // Clean up extracted text
    Object.keys(parsed).forEach(key => {
      if (parsed[key]) {
        parsed[key] = parsed[key].trim().replace(/\*\*/g, '').replace(/\n+/g, ' ');
      }
    });

    return parsed;
  }

  parseSituationalResponse(responseText) {
    const parsed = {
      situation: this.extractMatch(responseText, /\*\*Situation:\*\*\s*(.+?)(?=\*\*|$)/s, 1),
      verse: this.extractMatch(responseText, this.patterns.verse, 0),
      sanskrit: this.extractMatch(responseText, this.patterns.sanskrit, 1),
      translation: this.extractMatch(responseText, this.patterns.translation, 1),
      wisdom: this.extractMatch(responseText, /\*\*Wisdom for You:\*\*\s*(.+?)(?=\*\*|$)/s, 1),
      reminder: this.extractMatch(responseText, /\*\*Gentle Reminder:\*\*\s*(.+?)(?=\*\*|$)/s, 1)
    };

    // Clean up extracted text
    Object.keys(parsed).forEach(key => {
      if (parsed[key]) {
        parsed[key] = parsed[key].trim().replace(/\*\*/g, '').replace(/\n+/g, ' ');
      }
    });

    return parsed;
  }

  parseThematicResponse(responseText) {
    const parsed = {
      theme: this.extractMatch(responseText, /\*\*Theme:\*\*\s*(.+?)(?=\*\*|$)/s, 1),
      verse: this.extractMatch(responseText, this.patterns.verse, 0),
      sanskrit: this.extractMatch(responseText, this.patterns.sanskrit, 1),
      translation: this.extractMatch(responseText, this.patterns.translation, 1),
      application: this.extractMatch(responseText, /\*\*Application:\*\*\s*(.+?)(?=\*\*|$)/s, 1),
      affirmation: this.extractMatch(responseText, /\*\*Affirmation:\*\*\s*(.+?)(?=\*\*|$)/s, 1)
    };

    // Clean up extracted text
    Object.keys(parsed).forEach(key => {
      if (parsed[key]) {
        parsed[key] = parsed[key].trim().replace(/\*\*/g, '').replace(/\n+/g, ' ');
      }
    });

    return parsed;
  }

  // Helper method to extract regex matches
  extractMatch(text, pattern, groupIndex) {
    const match = text.match(pattern);
    if (match && match[groupIndex] !== undefined) {
      return groupIndex === 0 ? match[0] : match[groupIndex];
    }
    return null;
  }

  validateQuoteResponse(parsedQuote) {
  const hasVerse = parsedQuote.verse && parsedQuote.verse.length > 0;
  const hasSanskrit = parsedQuote.sanskrit && parsedQuote.sanskrit.length > 5;
  const hasTranslation = parsedQuote.translation && parsedQuote.translation.length > 10;
  const hasWisdom = parsedQuote.wisdom && parsedQuote.wisdom.length > 10;
  
  // Return true if we have at least translation OR wisdom
  const isValid = hasTranslation || hasWisdom;
  
  console.log("Validation results:", {
    hasVerse,
    hasSanskrit, 
    hasTranslation,
    hasWisdom,
    isValid
  });
  
  return isValid;
}


  validateVerse(verse) {
    if (!verse) return false;
    const match = verse.match(/(\d+)\.(\d+)/);
    if (!match) return false;
    
    const chapter = parseInt(match[1]);
    const verseNum = parseInt(match[2]);
    
    return chapter >= 1 && chapter <= 18 && verseNum >= 1;
  }

  validateSanskrit(sanskrit) {
    if (!sanskrit) return false;
    return this.patterns.hasSanskrit.test(sanskrit) && sanskrit.length > 10;
  }

  validateTranslation(translation) {
    if (!translation) return false;
    return this.patterns.hasMinimumLength.test(translation);
  }

  validateWisdom(wisdom) {
    if (!wisdom) return false;
    return this.patterns.hasMinimumLength.test(wisdom);
  }

  getFallbackQuote() {
    const fallbackQuotes = [
      {
        verse: "2.47",
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        translation: "You have the right to perform your actions, but you are not entitled to the fruits of action. Never let the fruits of action be your motive, nor let your attachment be to inaction.",
        wisdom: "Focus on your efforts and duties without being attached to the outcomes. This brings peace and reduces anxiety about results. When you work without attachment to success or failure, you find true freedom and inner calm."
      },
      {
        verse: "2.14",
        sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः। आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥",
        translation: "The experiences of heat and cold, pleasure and pain, are temporary. They come and go, so learn to endure them with patience.",
        wisdom: "Remember that all difficulties are temporary. Maintain your inner stability through life's ups and downs. Just as seasons change, your current challenges will also pass."
      },
      {
        verse: "6.5",
        sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
        translation: "One should lift oneself by one's own efforts and not degrade oneself. The mind alone is one's friend as well as one's enemy.",
        wisdom: "You have the power to elevate yourself through your own efforts. Be your own best friend and supporter. Your mind can either be your greatest ally or your worst enemy - train it to work for you."
      }
    ];

    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    // Create formatted response without stars
    const formattedQuote = `Verse: ${randomQuote.verse}\nSanskrit: ${randomQuote.sanskrit}\nTranslation: ${randomQuote.translation}\nToday's Wisdom: ${randomQuote.wisdom}`;
    
    return {
      success: false,
      quote: formattedQuote, 
      parsed: {
        verse: randomQuote.verse,
        sanskrit: randomQuote.sanskrit,
        translation: randomQuote.translation,
        wisdom: randomQuote.wisdom
      },
      fallback: true,
      timestamp: new Date()
    };
  }

  advanceSequentialVerse() {
    const verseCounts = {
      1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 
      9: 34, 10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 
      16: 24, 17: 28, 18: 78
    };

    this.currentVerse++;
    if (this.currentVerse > (verseCounts[this.currentChapter] || 50)) {
      this.currentChapter++;
      this.currentVerse = 1;
      if (this.currentChapter > 18) {
        this.currentChapter = 1; // Reset to beginning
      }
    }
  }

  // Method to get current sequential position
  getCurrentSequentialPosition() {
    return {
      chapter: this.currentChapter,
      verse: this.currentVerse,
      position: `${this.currentChapter}.${this.currentVerse}`
    };
  }

  // Method to set sequential position
  setSequentialPosition(chapter, verse) {
    if (this.validateVerse(`${chapter}.${verse}`)) {
      this.currentChapter = chapter;
      this.currentVerse = verse;
      return true;
    }
    return false;
  }

  // Method to get response statistics
  getResponseStats(parsedQuote) {
    return {
      hasVerse: !!parsedQuote.verse,
      hasSanskrit: !!parsedQuote.sanskrit,
      hasTranslation: !!parsedQuote.translation,
      hasWisdom: !!parsedQuote.wisdom,
      sanskritLength: parsedQuote.sanskrit ? parsedQuote.sanskrit.length : 0,
      translationLength: parsedQuote.translation ? parsedQuote.translation.length : 0,
      wisdomLength: parsedQuote.wisdom ? parsedQuote.wisdom.length : 0,
      isValid: this.validateQuoteResponse(parsedQuote)
    };
  }
}

module.exports = new GeminiService();