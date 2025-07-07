import Parser from 'rss-parser';
import { InsertNewsEvent, InsertArticle } from '../../shared/schema.js';
import { storage } from '../storage.js';
import { generateArticle } from './gemini.js';

interface RSSFeed {
  url: string;
  category: string;
  name: string;
}

class RSSFeedService {
  private parser = new Parser();
  
  private feeds: RSSFeed[] = [
    // Financial News
    { url: 'https://www.reuters.com/markets/us/rss', category: 'markets', name: 'Reuters Markets' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'markets', name: 'CNBC Markets' },
    
    // Technology News
    { url: 'https://feeds.feedburner.com/techcrunch/startups', category: 'tech', name: 'TechCrunch' },
    { url: 'https://www.wired.com/feed/rss', category: 'tech', name: 'Wired' },
    { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'tech', name: 'Ars Technica' },
    
    // Crypto News
    { url: 'https://cointelegraph.com/rss', category: 'crypto', name: 'CoinTelegraph' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', name: 'CoinDesk' },
    
    // World News
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world', name: 'BBC World' },
    { url: 'https://www.reuters.com/world/rss', category: 'world', name: 'Reuters World' },
    
    // US News
    { url: 'https://feeds.npr.org/1001/rss.xml', category: 'us', name: 'NPR' },
    { url: 'https://www.reuters.com/world/us/rss', category: 'us', name: 'Reuters US' },
    
    // UK News
    { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', category: 'uk', name: 'BBC UK' },
    
    // Companies/Business
    { url: 'https://www.reuters.com/business/rss', category: 'companies', name: 'Reuters Business' }
  ];

  async fetchAllFeeds(): Promise<void> {
    console.log('Fetching RSS feeds and generating articles...');
    
    for (const feed of this.feeds) {
      try {
        await this.processFeed(feed);
      } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);
      }
    }
    
    console.log('Finished processing all RSS feeds');
  }

  private async processFeed(feed: RSSFeed): Promise<void> {
    try {
      const parsedFeed = await this.parser.parseURL(feed.url);
      
      // Process latest 3 articles from each feed
      const recentItems = parsedFeed.items.slice(0, 3);
      
      for (const item of recentItems) {
        if (!item.title || !item.link) continue;
        
        // Check if we already have this article
        const existingArticles = await storage.searchArticles(item.title.substring(0, 50));
        const isDuplicate = existingArticles.some(article => 
          this.calculateSimilarity(article.title, item.title) > 0.8
        );
        
        if (isDuplicate) continue;
        
        // Create news event
        const newsEvent: InsertNewsEvent = {
          headline: item.title,
          description: item.contentSnippet || item.content || item.title,
          category: feed.category,
          source: feed.name,
          url: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          processed: false
        };
        
        const createdEvent = await storage.createNewsEvent(newsEvent);
        
        // Generate AI article
        const aiContent = await generateArticle(createdEvent);
        
        if (aiContent) {
          const article: InsertArticle = {
            title: aiContent.title,
            content: aiContent.content,
            summary: aiContent.summary,
            category: feed.category,
            authorName: this.getAuthorForCategory(feed.category),
            sourceUrl: item.link,
            imageUrl: this.getImageForCategory(feed.category),
            tags: this.extractTags(aiContent.content, feed.category),
            relatedSymbols: this.extractSymbols(aiContent.content),
            featured: this.shouldBeFeatured(aiContent),
            publishedAt: new Date(),
            views: 0,
            shares: 0
          };
          
          const createdArticle = await storage.createArticle(article);
          await storage.markNewsEventProcessed(createdEvent.id, createdArticle.id);
          
          console.log(`Generated article: ${article.title}`);
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feed.name}:`, error);
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  private getAuthorForCategory(category: string): string {
    const authors = {
      markets: 'Sarah Johnson',
      crypto: 'Alex Chen',
      tech: 'Michael Rodriguez',
      world: 'Emma Thompson',
      us: 'David Wilson',
      uk: 'Sophie Brown',
      companies: 'James Miller'
    };
    return authors[category as keyof typeof authors] || 'Editorial Team';
  }

  private extractTags(content: string, category: string): string[] {
    const categoryTags = {
      markets: ['stocks', 'trading', 'market analysis', 'finance'],
      crypto: ['cryptocurrency', 'blockchain', 'digital assets', 'trading'],
      tech: ['technology', 'innovation', 'startups', 'AI'],
      world: ['global news', 'international', 'politics'],
      us: ['United States', 'politics', 'economy'],
      uk: ['United Kingdom', 'Brexit', 'politics'],
      companies: ['business', 'earnings', 'corporate', 'finance']
    };
    
    return categoryTags[category as keyof typeof categoryTags] || ['news'];
  }

  private extractSymbols(content: string): string[] {
    const symbolPattern = /\b[A-Z]{2,5}\b/g;
    const matches = content.match(symbolPattern) || [];
    return matches.slice(0, 3); // Limit to 3 symbols
  }

  private shouldBeFeatured(aiContent: any): boolean {
    // Feature articles about major market movements or breaking news
    const featuredKeywords = ['breaking', 'major', 'significant', 'record', 'billion', 'trillion'];
    return featuredKeywords.some(keyword => 
      aiContent.title.toLowerCase().includes(keyword) || 
      aiContent.summary.toLowerCase().includes(keyword)
    );
  }

  private getImageForCategory(category: string): string {
    const images = {
      markets: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
      crypto: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&h=400&fit=crop',
      tech: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
      world: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=400&fit=crop',
      us: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
      uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop',
      companies: 'https://images.unsplash.com/photo-1664575602276-acd2d426b2b2?w=800&h=400&fit=crop'
    };
    
    return images[category as keyof typeof images] || 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=400&fit=crop';
  }
}

export const rssFeedService = new RSSFeedService();