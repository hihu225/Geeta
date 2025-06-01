// backend/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Track sequential verse progression
    this.currentChapter = 1;
    this.currentVerse = 1;
  }

  async getDailyQuote(language = "english", quoteType = "random") {
    try {
      const prompts = {
        random: this.getRandomQuotePrompt(language),
        sequential: this.getSequentialQuotePrompt(language),
        themed: this.getThemedQuotePrompt(language)
      };

      const prompt = prompts[quoteType] || prompts.random;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        quote: response.text(),
        timestamp: new Date(),
        type: quoteType,
        language: language
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return this.getFallbackQuote();
    }
  }

  getRandomQuotePrompt(language) {
    const languageInstructions = this.getLanguageInstructions(language);
    
    return `You are a spiritual guide sharing wisdom from the Bhagavad Gita. Generate a meaningful daily quote following this exact format:

**STRICT FORMATTING REQUIREMENTS:**
- Use exactly these section headers: **Verse:**, **Sanskrit:**, **Translation:**, **Today's Wisdom:**
- Keep each section concise but meaningful
- Ensure the verse actually exists in the Bhagavad Gita
- Make the wisdom practical and relatable to modern life

**Language:** ${languageInstructions.primary}

**Content Guidelines:**
1. Select a genuine verse from any chapter of the Bhagavad Gita
2. Provide accurate Sanskrit text (always include this regardless of target language)
3. Give a clear, beautiful translation in ${language}
4. Offer practical wisdom that applies to daily modern challenges

**Output Format**:
Verse: [${this.currentChapter}.${this.currentVerse}]
Sanskrit: [Authentic Sanskrit verse from Chapter ${this.currentChapter}, Verse ${this.currentVerse}]
Translation: [Clear and inspiring translation in ${language}]
Today's Wisdom: [2–3 concise sentences offering practical guidance on applying this verse in daily life, addressing common modern challenges such as stress, relationships, work, or personal growth]

${languageInstructions.additional}


Remember: Focus on verses that offer hope, guidance, and practical wisdom for someone seeking spiritual and personal growth.`;
  }

  getSequentialQuotePrompt(language) {
    const languageInstructions = this.getLanguageInstructions(language);
    
    return `You are providing sequential verses from the Bhagavad Gita for daily spiritual study. 

**Current Position:** Chapter ${this.currentChapter}, Verse ${this.currentVerse}

**STRICT FORMATTING REQUIREMENTS:**
- Use exactly these headers: **Verse:**, **Sanskrit:**, **Translation:**, **Daily Reflection:**
- Provide the exact verse requested, not a random one
- Include context about the verse's place in Krishna's teachings

**Language:** ${languageInstructions.primary}

**Output Format:**
Verse: ${this.currentChapter}.${this.currentVerse}
Sanskrit: [Provide the exact Sanskrit text for Chapter ${this.currentChapter}, Verse ${this.currentVerse}]
Translation: [Provide an accurate and fluent translation in ${language}]
Daily Reflection:

Context: Explain the situational or narrative context of this verse within the chapter.

Spiritual Meaning: Elaborate on the deeper spiritual or philosophical significance of this verse.

Practical Application: Suggest how one can apply the teachings of this verse in everyday life, with clear and actionable advice.

${languageInstructions.additional}



**Important:** This is part of a sequential study, so connect this verse to the overall flow of Krishna's teachings. Make it meaningful for someone following the Gita systematically.`;
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
      "cultivating gratitude and contentment"
    ];
    
    const randomTheme = todayThemes[Math.floor(Math.random() * todayThemes.length)];
    
    return `You are a wise spiritual counselor. Someone is struggling with ${randomTheme} and needs guidance from the Bhagavad Gita.

**STRICT FORMATTING REQUIREMENTS:**
- Use exactly these headers: **Today's Challenge:**, **Verse:**, **Sanskrit:**, **Translation:**, **Practical Guidance:**
- Choose a verse that directly addresses this life challenge
- Make the guidance actionable and specific

**Language:** ${languageInstructions.primary}

**Output Format**:
Today's Challenge: ${randomTheme}
Verse: [${this.currentChapter}.${this.currentVerse}]
Sanskrit: [Authentic Sanskrit text]
Translation: [Clear, comforting translation in ${language}]

Practical Guidance:

Explain why this verse is relevant to today’s challenge.

Suggest specific, practical steps to apply the verse’s wisdom.

Describe positive changes to expect from following this guidance.

Offer a gentle reminder or uplifting affirmation to inspire hope and perseverance.

${languageInstructions.additional}

Tone: Compassionate, wise, and encouraging — as if speaking to a dear friend seeking both spiritual insight and practical support.
  }
  `; 
  }
  getLanguageInstructions(language) {
    const instructions = {
      english: {
        primary: "Provide all translations and wisdom in clear, beautiful English",
        additional: "Use inspiring, accessible language that resonates with modern English speakers."
      },
      hindi: {
        primary: "सभी अनुवाद और ज्ञान सुंदर हिंदी में प्रदान करें",
        additional: "आधुनिक हिंदी भाषियों के लिए प्रेरणादायक और सुलभ भाषा का उपयोग करें।"
      },
      sanskrit: {
        primary: "Provide detailed Sanskrit commentary and explanation",
        additional: "Include word-by-word meaning and grammatical insights for Sanskrit students."
      },
      gujarati: {
        primary: "બધા અનુવાદ અને જ્ઞાન સુંદર ગુજરાતીમાં આપો",
        additional: "આધુનિક ગુજરાતી ભાષીઓ માટે પ્રેરણાદાયક અને સુલભ ભાષાનો ઉપયોગ કરો।"
      },
      tamil: {
        primary: "அனைத்து மொழிபெயர்ப்பு மற்றும் ஞானத்தையும் அழகான தமிழில் வழங்கவும்",
        additional: "நவீன தமிழ் பேசுபவர்களுக்கு ஊக்கமளிக்கும் மற்றும் அணுகக்கூடிய மொழியைப் பயன்படுத்தவும்।"
      }
    };

    return instructions[language.toLowerCase()] || instructions.english;
  }

  async getPersonalizedQuote(userContext) {
    try {
      const prompt = `You are a wise spiritual mentor who knows the Bhagavad Gita deeply. A person has shared their current life situation with you.

**User's Current Situation:**
${userContext}

**Your Task:** 
Provide personalized spiritual guidance using the most relevant Bhagavad Gita verse.

**STRICT FORMATTING REQUIREMENTS:**
- Use exactly these headers: **Your Situation:**, **Krishna's Guidance:**, **Verse:**, **Sanskrit:**, **Translation:**, **Personal Message:**

**Output Format**:
Your Situation:
[Acknowledge their current situation in 1–2 compassionate sentences, showing deep understanding and empathy.]

Krishna's Guidance:
[Explain why this particular verse is especially relevant and helpful for their situation, connecting the verse’s wisdom directly to their experience.]

Verse:
[${this.currentChapter}.${this.currentVerse}]

Sanskrit:
[Authentic Sanskrit text from the specified verse.]

Translation:
[Clear, meaningful English translation that relates to their circumstances.]

Personal Message:
[4–5 sentences offering personalized guidance that:

Addresses their unique challenges directly,

Suggests practical, actionable steps they can take,

Provides encouragement and hope,

Reminds them of their inner strength and divine nature.]

Tone:
Write with the warmth and insight of a caring mentor who truly understands their struggle, blending spiritual wisdom with compassionate, practical support. Avoid generic advice—be specific and heartfelt.


**Important:** Choose a verse that directly relates to their specific challenge, not just a general inspirational quote.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        quote: response.text(),
        personalized: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Personalized quote error:", error);
      return this.getDailyQuote(); // Fallback to regular quote
    }
  }

  // Enhanced method for wisdom-based queries
  async getWisdomForSituation(situation, emotionalState = "neutral") {
    try {
      const prompt = `A person is experiencing: "${situation}" and feeling ${emotionalState}.

As a wise guide familiar with the Bhagavad Gita, provide the most appropriate verse and guidance.

**STRICT FORMATTING:**
**Verse:** [Chapter.Verse]
**Sanskrit:** [Original text]
**Translation:** [English translation]
**Wisdom for You:** [Specific guidance for their situation and emotional state]
**Gentle Reminder:** [One inspiring sentence to uplift them]

Choose a verse that directly addresses their emotional state and situation. Be compassionate and practical.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        quote: response.text(),
        situational: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Situational wisdom error:", error);
      return this.getFallbackQuote();
    }
  }

  // Method to get quotes for specific life themes
  async getThematicQuote(theme) {
    const themePrompts = {
      morning: "starting the day with purpose and energy",
      evening: "reflecting on the day and finding peace",
      work: "approaching duties and responsibilities with the right attitude",
      relationships: "dealing with interpersonal challenges and conflicts",
      decision: "making important life choices with wisdom",
      stress: "managing pressure and maintaining inner calm",
      growth: "personal development and spiritual evolution"
    };

    const themeDescription = themePrompts[theme] || "general life guidance";
    
    try {
      const prompt = `Provide Bhagavad Gita wisdom specifically for ${themeDescription}.

**Format:**
**Theme:** ${themeDescription}
**Verse:** [Most relevant Chapter.Verse]
**Sanskrit:** [Original Sanskrit]
**Translation:** [Clear English translation]
**Application:** [How to apply this wisdom to ${themeDescription}]
**Affirmation:** [A positive statement based on this teaching]

Select a verse that directly relates to this theme and provide practical application.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        quote: response.text(),
        theme: theme,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Thematic quote error:", error);
      return this.getFallbackQuote();
    }
  }

  getFallbackQuote() {
    const fallbackQuotes = [
      {
        verse: "2.47",
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
        translation: "You have the right to perform your actions, but you are not entitled to the fruits of action.",
        wisdom: "Focus on your efforts and duties without being attached to the outcomes. This brings peace and reduces anxiety about results."
      },
      {
        verse: "2.14",
        sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।",
        translation: "The experiences of heat and cold, pleasure and pain, are temporary. They come and go.",
        wisdom: "Remember that all difficulties are temporary. Maintain your inner stability through life's ups and downs."
      },
      {
        verse: "6.5",
        sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।",
        translation: "One should lift oneself by one's own efforts and not degrade oneself.",
        wisdom: "You have the power to elevate yourself through your own efforts. Be your own best friend and supporter."
      }
    ];

    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    return {
      success: false,
      quote: `**Verse:** ${randomQuote.verse}\n**Sanskrit:** ${randomQuote.sanskrit}\n**Translation:** ${randomQuote.translation}\n**Today's Wisdom:** ${randomQuote.wisdom}`,
      fallback: true,
      timestamp: new Date()
    };
  }

  // Method to advance sequential reading
  advanceSequentialVerse() {
    // Approximate verse counts per chapter (simplified)
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
}

module.exports = new GeminiService();