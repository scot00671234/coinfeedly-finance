import { GoogleGenAI } from '@google/genai';
import { storage } from '../storage';
import type { InsertArticle } from '@shared/schema';

// Simple article generation service
class ArticleService {
  private genai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not set - article generation disabled');
      return;
    }
    this.genai = new GoogleGenAI({ apiKey });
  }

  async generateArticle(): Promise<void> {
    if (!this.genai) {
      console.log('⚠️ Article generation skipped - no API key');
      return;
    }

    try {
      console.log('🤖 Generating new article...');

      const model = this.genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const topics = [
        'technology market trends',
        'cryptocurrency market analysis',
        'stock market performance',
        'economic indicators',
        'financial sector updates'
      ];

      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const prompt = `Write a professional financial news article about ${randomTopic}. 
      Include:
      - A compelling headline
      - A brief summary (2-3 sentences)
      - A detailed article (3-4 paragraphs)
      - Make it objective and informative
      
      Format your response as JSON:
      {
        "title": "Article title here",
        "summary": "Brief summary here",
        "content": "Full article content here"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const articleData = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      
      // Create slug from title
      const slug = this.createSlug(articleData.title);
      
      // Prepare article for database
      const article: InsertArticle = {
        title: articleData.title,
        slug: slug,
        content: articleData.content,
        summary: articleData.summary,
        category: this.getRandomCategory(),
        authorName: 'Financial News Team',
        featured: Math.random() > 0.7, // 30% chance of being featured
        tags: this.extractTags(articleData.content),
        relatedSymbols: []
      };

      // Save to database
      await storage.createArticle(article);
      console.log('✅ Article generated and saved:', article.title);

    } catch (error) {
      console.error('❌ Error generating article:', error.message);
    }
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }

  private getRandomCategory(): string {
    const categories = ['Markets', 'Crypto', 'Tech', 'Companies', 'World'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private extractTags(content: string): string[] {
    const commonTags = ['finance', 'markets', 'technology', 'business', 'economy'];
    return commonTags.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  // Start periodic article generation
  startPeriodicGeneration() {
    if (!this.genai) {
      console.log('⚠️ Periodic article generation disabled - no API key');
      return;
    }

    // Generate first article immediately
    setTimeout(() => this.generateArticle(), 5000);

    // Then every 30 minutes
    setInterval(() => this.generateArticle(), 30 * 60 * 1000);
    
    console.log('🕒 Periodic article generation started (every 30 minutes)');
  }
}

export const articleService = new ArticleService();