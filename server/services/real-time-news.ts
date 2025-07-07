import { generateArticleWithGrounding } from './gemini';
import { storage } from '../storage';
import type { InsertArticle } from '@shared/schema';

class RealTimeNewsService {
  private newsTopics = [
    // Markets
    { topic: "stock market earnings reports", category: "markets" },
    { topic: "Federal Reserve interest rates", category: "markets" },
    { topic: "NYSE trading activity", category: "markets" },
    { topic: "S&P 500 market movements", category: "markets" },
    
    // Crypto
    { topic: "Bitcoin price movement", category: "crypto" },
    { topic: "Ethereum blockchain updates", category: "crypto" },
    { topic: "cryptocurrency regulation news", category: "crypto" },
    { topic: "DeFi protocol developments", category: "crypto" },
    
    // Tech
    { topic: "artificial intelligence industry news", category: "tech" },
    { topic: "technology startup funding", category: "tech" },
    { topic: "software company earnings", category: "tech" },
    { topic: "cloud computing developments", category: "tech" },
    
    // Companies
    { topic: "Fortune 500 company news", category: "companies" },
    { topic: "merger and acquisition activity", category: "companies" },
    { topic: "corporate earnings announcements", category: "companies" },
    { topic: "CEO leadership changes", category: "companies" },
    
    // World
    { topic: "global economic developments", category: "world" },
    { topic: "international trade agreements", category: "world" },
    { topic: "central bank policy changes", category: "world" },
    { topic: "geopolitical financial impact", category: "world" },
    
    // US
    { topic: "US economic policy changes", category: "us" },
    { topic: "Congressional financial legislation", category: "us" },
    { topic: "US inflation data", category: "us" },
    { topic: "American employment statistics", category: "us" },
    
    // UK
    { topic: "Bank of England policy", category: "uk" },
    { topic: "Brexit economic impact", category: "uk" },
    { topic: "UK financial services", category: "uk" },
    { topic: "London Stock Exchange", category: "uk" }
  ];

  async generateRealTimeArticles(): Promise<void> {
    console.log('Generating real-time articles with web grounding...');
    
    // Generate 2-3 articles per hour to keep content fresh
    const selectedTopics = this.getRandomTopics(3);
    
    for (const topicData of selectedTopics) {
      try {
        console.log(`Generating article for: ${topicData.topic}`);
        
        const articleData = await generateArticleWithGrounding(topicData.topic, topicData.category);
        
        // Check if similar article already exists
        const existingArticles = await storage.getArticlesByCategory(topicData.category, 20);
        const similarExists = existingArticles.some(existing => 
          this.calculateSimilarity(existing.title, articleData.title) > 0.7
        );

        if (similarExists) {
          console.log(`Similar article exists, skipping: ${articleData.title}`);
          continue;
        }

        const article: InsertArticle = {
          title: articleData.title,
          content: articleData.content,
          summary: articleData.summary,
          category: articleData.category,
          authorName: articleData.authorName,
          publishedAt: new Date(),
          featured: Math.random() < 0.3, // 30% chance of being featured
          tags: articleData.tags,
          relatedSymbols: articleData.relatedSymbols,
          views: Math.floor(Math.random() * 1000) + 50,
          shares: Math.floor(Math.random() * 100) + 5,
          imageUrl: this.getImageForCategory(topicData.category)
        };

        const createdArticle = await storage.createArticle(article);
        console.log(`✓ Created article: ${createdArticle.title}`);
        
        // Add a small delay between articles
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error generating article for ${topicData.topic}:`, error);
      }
    }
  }

  private getRandomTopics(count: number) {
    const shuffled = [...this.newsTopics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '');
    const words1 = normalize(str1).split(/\s+/);
    const words2 = normalize(str2).split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private getImageForCategory(category: string): string {
    const images = {
      markets: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=400&fit=crop',
      crypto: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
      tech: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=400&fit=crop',
      world: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop',
      companies: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
      us: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
      uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop'
    };

    return images[category as keyof typeof images] || images.world;
  }
}

export const realTimeNewsService = new RealTimeNewsService();