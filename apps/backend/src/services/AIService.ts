import { GoogleGenerativeAI } from "@google/generative-ai";

interface GenerateMessageRequest {
  to?: string;
  from?: string;
  occasion?: string;
  keywords?: string;
  tone?: string;
  userPrompt?: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private cache: Map<string, { message: string; timestamp: number }>;
  private CACHE_TTL = 3600000; // 1 hour cache

  // Tone mapping - defined once as class property
  private readonly TONE_MAPPING: Record<string, string> = {
    'warm': 'warm and affectionate',
    'warmer': 'deeply warm and loving',
    'heartfelt': 'sincere and heartfelt',
    'romantic': 'romantic and passionate',
    'happy': 'cheerful and uplifting',
    'joyful': 'joyful and celebratory',
    'funny': 'lighthearted and humorous',
    'playful': 'playful and fun',
    'professional': 'professional and elegant',
    'formal': 'formal and respectful',
    'casual': 'casual and friendly',
    'grateful': 'thankful and appreciative',
    'supportive': 'supportive and encouraging',
    'sympathetic': 'compassionate and comforting',
    'congratulatory': 'congratulatory and proud'
  };

  private async generateText(prompt: string, generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  }): Promise<string> {
    const options = generationConfig ? { generationConfig } : undefined;
    const result = await this.model.generateContent(prompt, options);
    const response = await result.response;
    return response.text();
  }

  /**
   * Remove accidental greetings and sign-offs from generated text
   */
  private cleanupGeneratedText(text: string): string {
    return text
      .replace(/^(Dear|My dear|Hi|Hello|Hey)[,\s]+/gi, '')
      .replace(/[,\s]+(Love|Sincerely|Warmly|Best|Yours)[,\s]*$/gi, '');
  }

  /**
   * Clean old cache entries to prevent memory bloat
   */
  private cleanupCache(): void {
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("⚠️  GEMINI_API_KEY not found in environment variables. AI features will not work.");
    }

    this.genAI = new GoogleGenerativeAI(apiKey || "");
    // Use gemini-2.5-flash (free model)
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
    this.cache = new Map();
  }

  /**
   * Generate a personalized gift message using Gemini AI
   */
  async generateGiftMessage(request: GenerateMessageRequest): Promise<string> {
    try {
      const { to, from, occasion, keywords, tone, userPrompt } = request;
      const sanitizedUserPrompt = userPrompt?.trim();
      const lengthSpec = '2-3 sentences';
      const maxTokens = 80; // Reduced from 120 for faster generation

      // Create cache key (include detected length)
      const cacheKey = JSON.stringify({
        to,
        from,
        occasion,
        keywords,
        tone,
        lengthSpec,
        userPrompt: sanitizedUserPrompt,
      });

      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('✅ Using cached AI message');
        return cached.message;
      }

      // Map tone to specific styles using class property
      const mappedTone = tone ? (this.TONE_MAPPING[tone.toLowerCase()] || tone) : 'warm and heartfelt';

      const contextParts: string[] = [];
      if (from || to) {
        contextParts.push(`Gift from ${from || 'sender'} to ${to || 'recipient'}.`);
      }
      if (occasion) {
        contextParts.push(`Occasion: ${occasion}.`);
      }
      if (keywords) {
        contextParts.push(`Theme: ${keywords}.`);
      }
      const context = contextParts.join(' ');

      const userPromptLine = sanitizedUserPrompt ? `User request: "${sanitizedUserPrompt}".\n` : '';

      const prompt = `Write a ${mappedTone} gift card message for flowers.
${context}${context ? '\n' : ''}${userPromptLine}Rules: ${lengthSpec} only, no names/greetings/signoffs, gift card style. Respond in a warm, natural tone that feels personal from the sender to the recipient.
Message:`;

      // Use optimized generation config for speed and quality
      let text = (await this.generateText(prompt, {
        temperature: 0.9, // Higher temperature for faster, more creative responses
        maxOutputTokens: maxTokens,
        topP: 0.95, // Increased for more variety and speed
        topK: 40,
      })).trim();

      // Post-process to remove any accidental names or greetings
      text = this.cleanupGeneratedText(text);

      // Store in cache
      this.cache.set(cacheKey, { message: text, timestamp: Date.now() });

      // Clean old cache entries (keep max 100 entries)
      this.cleanupCache();

      return text;
    } catch (error: any) {
      console.error("❌ Error generating AI message:", error.message);
      throw new Error("Failed to generate AI message. Please try again.");
    }
  }

  /**
   * Generate message suggestions based on product type
   */
  async generateMessageSuggestions(productName?: string, productDescription?: string): Promise<string[]> {
    try {
      let prompt = "Generate 3 short, sweet gift message suggestions for a flower delivery. ";

      if (productName) {
        prompt += `The flowers are: ${productName}. `;
      }

      if (productDescription) {
        prompt += `Product description: ${productDescription}. `;
      }

      prompt += "Each message should be 1-2 sentences, warm and genuine. Return only the messages, numbered 1-3.";

      const text = await this.generateText(prompt);

      // Split by numbers and clean up
      const suggestions = text
        .split(/\d+\.\s/)
        .filter((msg: string) => msg.trim().length > 0)
        .map((msg: string) => msg.trim())
        .slice(0, 3);

      return suggestions;
    } catch (error: any) {
      console.error("❌ Error generating message suggestions:", error.message);
      return [
        "Thinking of you and sending beautiful blooms your way!",
        "Hope these flowers brighten your day as much as you brighten mine.",
        "Wishing you joy and beauty, just like these flowers."
      ];
    }
  }

  /**
   * Check if AI service is properly configured
   */
  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  /**
   * Pre-warm cache with common message combinations for faster demo/production use
   */
  async prewarmCache(): Promise<void> {
    if (!this.isConfigured()) return;

    console.log('🔥 Pre-warming AI message cache...');

    const commonRequests = [
      { tone: 'warm', keywords: 'flowers, love', from: 'sender', to: 'recipient' },
      { tone: 'romantic', keywords: 'roses, love', from: 'sender', to: 'recipient' },
      { tone: 'happy', keywords: 'flowers, birthday', from: 'sender', to: 'recipient' },
      { tone: 'grateful', keywords: 'flowers, thanks', from: 'sender', to: 'recipient' },
      { tone: 'congratulatory', keywords: 'flowers, celebration', from: 'sender', to: 'recipient' },
    ];

    try {
      await Promise.all(
        commonRequests.map(req => this.generateGiftMessage(req).catch(() => {
          console.log(`⚠️  Failed to prewarm: ${req.tone}`);
        }))
      );
      console.log('✅ AI cache pre-warmed successfully!');
    } catch (error) {
      console.log('⚠️  Cache pre-warming had some issues, but continuing...');
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
