import { GoogleGenAI } from '@google/genai';
import { db } from './database';
import { articles } from '@shared/schema';
import type { InsertArticle } from '@shared/schema';

// Clean article generation service
export class ArticleGenerator {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      console.log('✅ AI article generation ready');
    } else {
      console.log('⚠️ AI disabled (no API key)');
    }
  }

  async generateArticle(): Promise<boolean> {
    if (!this.ai) return false;

    try {
      console.log('🤖 Generating article...');
      
      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const topics = [
        'stock market trends',
        'cryptocurrency analysis',
        'economic indicators',
        'technology sector news',
        'financial market outlook'
      ];

      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const prompt = `Write a professional financial news article about ${topic}. 
      
      Return only JSON:
      {
        "title": "Professional headline",
        "summary": "Brief summary (2 sentences)",
        "content": "Full article (400-500 words, 3-4 paragraphs)"
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(text);
      
      const slug = this.createSlug(data.title);
      
      const article: InsertArticle = {
        title: data.title,
        slug: slug,
        content: data.content,
        summary: data.summary,
        category: this.randomCategory(),
        authorName: 'Financial News',
        featured: Math.random() > 0.7,
        tags: ['finance', 'news'],
        relatedSymbols: []
      };

      await db.insert(articles).values(article);
      console.log('✅ Article created:', data.title);
      return true;

    } catch (error) {
      console.error('❌ Article generation failed:', error.message);
      return false;
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

  start() {
    if (!this.ai) return;
    
    // Generate first article after 10 seconds
    setTimeout(() => this.generateArticle(), 10000);
    
    // Then every 30 minutes
    setInterval(() => this.generateArticle(), 30 * 60 * 1000);
    
    console.log('🕒 Article generation started');
  }
}

export const articleGenerator = new ArticleGenerator();