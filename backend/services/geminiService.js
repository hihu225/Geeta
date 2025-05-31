// backend/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async getDailyQuote(language = "english", quoteType = "random") {
    try {
      const prompts = {
        random: `Generate a daily inspirational quote from Bhagavad Gita in ${language} language. 
                Include the verse number, Sanskrit text (if not in Sanskrit), translation, and a brief practical application for modern life. 
                Format it as: 
                **Verse:** [Chapter.Verse]
                **Sanskrit:** [Original text]
                **Translation:** [Translation]
                **Message:** [Practical wisdom]`,
        
        sequential: `Generate the next verse from Bhagavad Gita in sequential order in ${language} language. 
                    Start from Chapter 1 if this is the first request. Include verse number, Sanskrit text, translation, and practical meaning.`,
        
        themed: `Generate a Bhagavad Gita quote related to today's common life challenges like stress, work-life balance, relationships, or personal growth in ${language} language. 
                Include verse reference, original text, translation, and how to apply this wisdom today.`
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
      return {
        success: false,
        error: error.message,
        // Fallback quote
        quote: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। (You have the right to perform your actions, but you are not entitled to the fruits of action.) - Bhagavad Gita 2.47"
      };
    }
  }

  async getPersonalizedQuote(userContext) {
    try {
      const prompt = `Based on this user context: ${userContext}, 
                     generate a personalized Bhagavad Gita quote that would be most relevant. 
                     Include verse reference, Sanskrit text, English translation, and personalized guidance.`;
      
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
}

module.exports = new GeminiService();