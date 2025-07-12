import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { articles } from '@shared/schema';
import type { InsertArticle } from '@shared/schema';

// Clean, simple article generation
class SimpleArticleService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      console.log('✅ AI article generation enabled');
    } else {
      console.log('⚠️ AI article generation disabled (no API key)');
    }
  }

  async generateArticle(): Promise<void> {
    if (!this.ai) return;

    try {
      console.log('🤖 Generating article...');
      
      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const topics = [
        'stock market performance today',
        'cryptocurrency price movements',
        'technology sector outlook',
        'economic indicators analysis',
        'financial market trends'
      ];

      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const prompt = `Write a professional financial news article about ${topic}. 
      
      Return ONLY a JSON object with these fields:
      {
        "title": "Clear, professional headline",
        "summary": "Brief 2-sentence summary",
        "content": "Full article (3-4 paragraphs, 300-500 words)"
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean up the JSON response
      const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(jsonText);
      
      // Create unique slug
      const slug = this.createSlug(data.title);
      
      const articleData: InsertArticle = {
        title: data.title,
        slug: slug,
        content: data.content,
        summary: data.summary,
        category: this.randomCategory(),
        authorName: 'Financial News Team',
        featured: Math.random() > 0.7,
        tags: ['finance', 'news'],
        relatedSymbols: []
      };

      await db.insert(articles).values(articleData);
      console.log('✅ Article generated:', data.title);

    } catch (error) {
      console.error('❌ Article generation failed:', error.message);
    }
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }

  private randomCategory(): string {
    const categories = ['Markets', 'Crypto', 'Tech', 'Companies', 'World'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  startGeneration() {
    if (!this.ai) return;

    // Generate first article after 10 seconds
    setTimeout(() => this.generateArticle(), 10000);

    // Then every 30 minutes
    setInterval(() => this.generateArticle(), 30 * 60 * 1000);
    
    console.log('🕒 Article generation scheduled');
  }
}

export const simpleArticleService = new SimpleArticleService();