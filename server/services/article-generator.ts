import { generateArticle, analyzeSentiment } from './gemini';
import { storage } from '../storage';
import type { NewsEvent, InsertArticle } from '@shared/schema';

class ArticleGenerator {
  private readonly authorNames = [
    'Sarah Chen',
    'Michael Rodriguez',
    'David Kim',
    'Emily Johnson',
    'Robert Thompson',
    'Lisa Wang',
    'James Mitchell',
    'Maria Santos',
    'Alexander Brown',
    'Jennifer Lee'
  ];

  private readonly categoryKeywords = {
    BREAKING: ['breaking', 'urgent', 'alert', 'emergency', 'major'],
    CRYPTO: ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft'],
    STOCKS: ['stock', 'equity', 'shares', 'earnings', 'dividend'],
    COMMODITIES: ['gold', 'oil', 'silver', 'commodity', 'futures'],
    EARNINGS: ['earnings', 'revenue', 'profit', 'quarterly', 'results']
  };

  async generateArticle(newsEvent: NewsEvent): Promise<InsertArticle | null> {
    try {
      // Analyze sentiment first
      const sentiment = await analyzeSentiment(newsEvent.summary);
      
      // Generate the article using Gemini
      const articleData = await generateArticle(newsEvent);
      
      // Determine if article should be featured
      const shouldBeFeatured = this.shouldBeFeatured(newsEvent, sentiment);
      
      // Generate image URL based on category
      const imageUrl = this.generateImageUrl(articleData.category);
      
      const insertArticle: InsertArticle = {
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary,
        category: articleData.category,
        imageUrl,
        authorName: articleData.authorName,
        featured: shouldBeFeatured,
        tags: articleData.tags,
        relatedSymbols: articleData.relatedSymbols
      };

      return insertArticle;
    } catch (error) {
      console.error('Error generating article:', error);
      return null;
    }
  }

  private shouldBeFeatured(newsEvent: NewsEvent, sentiment: any): boolean {
    // Feature articles that are:
    // 1. Breaking news
    // 2. High confidence sentiment (>0.8)
    // 3. Involve major symbols (BTC, ETH, SPY, etc.)
    
    const majorSymbols = ['BTC', 'ETH', 'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    const hasBreakingKeywords = newsEvent.headline.toLowerCase().includes('breaking') || 
                               newsEvent.headline.toLowerCase().includes('urgent');
    const hasMajorSymbols = newsEvent.symbols?.some(symbol => 
      majorSymbols.includes(symbol.toUpperCase())
    );
    const highConfidenceSentiment = sentiment.confidence > 0.8;

    return hasBreakingKeywords || (hasMajorSymbols && highConfidenceSentiment);
  }

  private generateImageUrl(category: string): string {
    const imageMap = {
      'BREAKING': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
      'CRYPTO': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
      'STOCKS': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
      'COMMODITIES': 'https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
      'EARNINGS': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400'
    };

    return imageMap[category as keyof typeof imageMap] || imageMap.BREAKING;
  }

  async createNewsEventAndGenerateArticle(
    headline: string,
    summary: string,
    source: string,
    symbols: string[] = [],
    publishedAt: Date = new Date()
  ): Promise<void> {
    try {
      // Create news event
      const newsEvent = await storage.createNewsEvent({
        headline,
        summary,
        source,
        publishedAt,
        symbols
      });

      // Generate article
      const article = await this.generateArticle(newsEvent);
      
      if (article) {
        const createdArticle = await storage.createArticle(article);
        await storage.markNewsEventProcessed(newsEvent.id, createdArticle.id);
        
        console.log(`Successfully generated article: ${createdArticle.title}`);
      }
    } catch (error) {
      console.error('Error creating news event and generating article:', error);
    }
  }
}

export const articleGenerator = new ArticleGenerator();
