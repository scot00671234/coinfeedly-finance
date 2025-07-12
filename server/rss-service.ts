import { db } from './database';
import { articles } from '@shared/schema';
import type { InsertArticle } from '@shared/schema';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

// RSS feed sources for crypto and finance
const RSS_SOURCES = [
  {
    url: 'https://cointelegraph.com/rss',
    category: 'Crypto',
    name: 'CoinTelegraph'
  },
  {
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'Crypto', 
    name: 'CoinDesk'
  },
  {
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Markets',
    name: 'Bloomberg'
  },
  {
    url: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'Finance',
    name: 'Reuters'
  }
];

export class RSSService {
  private isProcessing = false;

  async fetchRSSFeed(url: string): Promise<RSSItem[]> {
    try {
      console.log(`📡 Fetching RSS from ${url}`);
      
      // Simple RSS parsing using basic fetch and regex
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const items: RSSItem[] = [];

      // Extract items using regex (simple approach)
      const itemMatches = text.match(/<item[^>]*>(.*?)<\/item>/gs) || [];
      
      for (const itemMatch of itemMatches.slice(0, 10)) { // Limit to 10 items
        const titleMatch = itemMatch.match(/<title[^>]*>(.*?)<\/title>/s);
        const descMatch = itemMatch.match(/<description[^>]*>(.*?)<\/description>/s);
        const linkMatch = itemMatch.match(/<link[^>]*>(.*?)<\/link>/s);
        const pubDateMatch = itemMatch.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s);

        if (titleMatch && descMatch) {
          items.push({
            title: this.cleanText(titleMatch[1]),
            description: this.cleanText(descMatch[1]),
            link: linkMatch ? linkMatch[1].trim() : '',
            pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString()
          });
        }
      }

      return items;
    } catch (error) {
      console.error(`❌ RSS fetch failed for ${url}:`, error.message);
      return [];
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }

  async processAllFeeds(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      console.log('🔄 Processing RSS feeds...');
      
      for (const source of RSS_SOURCES) {
        const items = await this.fetchRSSFeed(source.url);
        
        for (const item of items) {
          try {
            // Check if article already exists
            const existingArticle = await db.query.articles.findFirst({
              where: (articles, { eq }) => eq(articles.title, item.title)
            });

            if (!existingArticle) {
              const article: InsertArticle = {
                title: item.title,
                slug: this.createSlug(item.title),
                content: item.description,
                summary: item.description.substring(0, 200) + '...',
                category: source.category,
                authorName: source.name,
                featured: Math.random() > 0.8,
                tags: [source.category.toLowerCase(), 'news'],
                relatedSymbols: []
              };

              await db.insert(articles).values(article);
              console.log(`✅ Added: ${item.title}`);
            }
          } catch (error) {
            console.error('❌ Failed to save article:', error.message);
          }
        }
      }

      console.log('✅ RSS processing complete');
    } catch (error) {
      console.error('❌ RSS processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  start() {
    console.log('🚀 Starting RSS service...');
    
    // Initial fetch after 5 seconds
    setTimeout(() => this.processAllFeeds(), 5000);
    
    // Then every 10 minutes
    setInterval(() => this.processAllFeeds(), 10 * 60 * 1000);
  }
}

export const rssService = new RSSService();