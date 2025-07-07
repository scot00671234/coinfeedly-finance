import { newsAPIService, type NewsApiArticle } from './news-api';
import { generateArticle, analyzeSentiment } from './gemini';
import { storage } from '../storage';
import type { InsertArticle, InsertNewsEvent } from '@shared/schema';

class RealNewsGenerator {
  async generateAndSaveArticles(): Promise<void> {
    try {
      console.log('Fetching real news and generating articles...');
      
      // Fetch news from different categories
      const [financialNews, techNews, worldNews, cryptoNews] = await Promise.all([
        newsAPIService.getFinancialNews(5),
        newsAPIService.getTechNews(5),
        newsAPIService.getWorldNews(5),
        newsAPIService.getCryptoNews(5)
      ]);

      // Process each category
      await this.processNewsCategory(financialNews, 'markets');
      await this.processNewsCategory(techNews, 'tech');
      await this.processNewsCategory(worldNews, 'world');
      await this.processNewsCategory(cryptoNews, 'crypto');

      console.log('Finished generating articles from real news');
    } catch (error) {
      console.error('Error in real news generation:', error);
    }
  }

  private async processNewsCategory(articles: NewsApiArticle[], category: string): Promise<void> {
    for (const newsArticle of articles) {
      try {
        // Check if we already have this article (by title similarity)
        const existingArticles = await storage.getArticlesByCategory(category, 50);
        const titleExists = existingArticles.some(existing => 
          this.calculateSimilarity(existing.title, newsArticle.title) > 0.8
        );

        if (titleExists) {
          continue; // Skip if we already have a similar article
        }

        // Create a news event first
        const newsEvent: InsertNewsEvent = {
          title: newsArticle.title,
          description: newsArticle.description || newsArticle.title,
          category,
          publishedAt: new Date(newsArticle.publishedAt),
          sourceUrl: newsArticle.url,
          processed: false
        };

        const createdEvent = await storage.createNewsEvent(newsEvent);

        // Generate enhanced article using AI
        const enhancedContent = await this.enhanceArticleWithAI(newsArticle, category);
        
        if (enhancedContent) {
          const article: InsertArticle = {
            title: enhancedContent.title,
            content: enhancedContent.content,
            summary: enhancedContent.summary,
            category,
            authorName: this.getAuthorForCategory(category),
            publishedAt: new Date(newsArticle.publishedAt),
            featured: Math.random() < 0.2, // 20% chance of being featured
            tags: this.extractTags(newsArticle.title + ' ' + newsArticle.description, category),
            relatedSymbols: this.extractSymbols(newsArticle.title + ' ' + newsArticle.description),
            views: Math.floor(Math.random() * 5000) + 100,
            shares: Math.floor(Math.random() * 200) + 10,
            imageUrl: newsArticle.urlToImage || this.getDefaultImageForCategory(category)
          };

          const createdArticle = await storage.createArticle(article);
          await storage.markNewsEventProcessed(createdEvent.id, createdArticle.id);
          
          console.log(`Created article: ${createdArticle.title}`);
        }
      } catch (error) {
        console.error(`Error processing article: ${newsArticle.title}`, error);
      }
    }
  }

  private async enhanceArticleWithAI(newsArticle: NewsApiArticle, category: string): Promise<{
    title: string;
    content: string;
    summary: string;
  } | null> {
    try {
      const prompt = `Based on this news article, create an enhanced financial news article:

Title: ${newsArticle.title}
Description: ${newsArticle.description}
Category: ${category}

Please provide:
1. An enhanced, engaging title
2. A comprehensive article content (300-500 words)
3. A concise summary (50-100 words)

Focus on financial implications, market impact, and provide professional analysis.`;

      const result = await generateArticle({
        title: newsArticle.title,
        description: newsArticle.description || '',
        category,
        publishedAt: new Date(newsArticle.publishedAt),
        sourceUrl: newsArticle.url,
        id: 0,
        processed: false
      });

      return result;
    } catch (error) {
      console.error('Error enhancing article with AI:', error);
      return null;
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '');
    const words1 = normalize(str1).split(/\s+/);
    const words2 = normalize(str2).split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private getAuthorForCategory(category: string): string {
    const authors = {
      markets: ['James Mitchell', 'Sarah Chen', 'Robert Williams', 'Emily Davis'],
      crypto: ['Alex Rodriguez', 'Maria Santos', 'David Kim', 'Jessica Taylor'],
      tech: ['Michael Zhang', 'Lisa Johnson', 'Kevin Park', 'Amanda Foster'],
      world: ['Daniel Thompson', 'Sophie Wilson', 'Mark Anderson', 'Rachel Green'],
      companies: ['Thomas Brown', 'Jennifer Walsh', 'Andrew Miller', 'Nicole Adams'],
      us: ['Christopher Lee', 'Ashley Martinez', 'Ryan Clark', 'Stephanie Hall'],
      uk: ['William Turner', 'Emma Wright', 'Oliver Lewis', 'Charlotte Harris']
    };

    const categoryAuthors = authors[category as keyof typeof authors] || authors.world;
    return categoryAuthors[Math.floor(Math.random() * categoryAuthors.length)];
  }

  private extractTags(text: string, category: string): string[] {
    const commonTags = {
      markets: ['stocks', 'trading', 'earnings', 'market-analysis'],
      crypto: ['blockchain', 'bitcoin', 'ethereum', 'defi'],
      tech: ['innovation', 'startup', 'technology', 'ai'],
      world: ['global', 'international', 'politics', 'economy'],
      companies: ['business', 'corporate', 'strategy', 'leadership'],
      us: ['america', 'federal', 'policy', 'domestic'],
      uk: ['britain', 'brexit', 'london', 'parliament']
    };

    const baseTags = commonTags[category as keyof typeof commonTags] || ['news', 'analysis'];
    const extractedTags: string[] = [];

    // Extract company/symbol mentions
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC', 'ETH'];
    symbols.forEach(symbol => {
      if (text.toUpperCase().includes(symbol)) {
        extractedTags.push(symbol.toLowerCase());
      }
    });

    return [...baseTags.slice(0, 2), ...extractedTags].slice(0, 4);
  }

  private extractSymbols(text: string): string[] {
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC-USD', 'ETH-USD'];
    return symbols.filter(symbol => 
      text.toUpperCase().includes(symbol.replace('-USD', ''))
    );
  }

  private getDefaultImageForCategory(category: string): string {
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

export const realNewsGenerator = new RealNewsGenerator();