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
  },
  {
    url: 'https://feeds.feedburner.com/techcrunch',
    category: 'Tech',
    name: 'TechCrunch'
  },
  {
    url: 'https://feeds.reuters.com/reuters/technologyNews',
    category: 'Tech',
    name: 'Reuters Tech'
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
          // Try to get full content from content:encoded or use description
          const contentMatch = itemMatch.match(/<content:encoded[^>]*>(.*?)<\/content:encoded>/s);
          let fullContent = contentMatch ? this.cleanText(contentMatch[1]) : this.cleanText(descMatch[1]);
          
          // If content is still short, try to fetch from the original URL
          if (fullContent.length < 500 && linkMatch) {
            try {
              const fullArticle = await this.fetchFullArticle(linkMatch[1].trim());
              if (fullArticle && fullArticle.length > fullContent.length) {
                fullContent = fullArticle;
              }
            } catch (error) {
              console.log(`⚠️ Could not fetch full article from ${linkMatch[1]}`);
            }
          }
          
          items.push({
            title: this.cleanText(titleMatch[1]),
            description: fullContent,
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

  private async fetchFullArticle(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });

      if (!response.ok) return null;

      const html = await response.text();
      
      // Extract main content using common selectors
      const contentSelectors = [
        'article',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
        'main',
        '[role="main"]'
      ];
      
      for (const selector of contentSelectors) {
        const match = html.match(new RegExp(`<${selector}[^>]*>(.*?)<\/${selector}>`, 'gs'));
        if (match && match[0]) {
          const content = this.cleanText(match[0]);
          if (content.length > 300) {
            return content;
          }
        }
      }

      // Fallback: extract paragraphs
      const paragraphs = html.match(/<p[^>]*>(.*?)<\/p>/gs) || [];
      const fullText = paragraphs.map(p => this.cleanText(p)).join('\n\n');
      
      return fullText.length > 300 ? fullText : null;
    } catch (error) {
      return null;
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
              // Categorize more precisely based on content
              let finalCategory = source.category;
              const title = item.title.toLowerCase();
              const content = item.description.toLowerCase();
              
              if (title.includes('bitcoin') || title.includes('crypto') || content.includes('cryptocurrency')) {
                finalCategory = 'Crypto';
              } else if (title.includes('stock') || title.includes('market') || content.includes('trading')) {
                finalCategory = 'Markets';
              } else if (title.includes('tech') || title.includes('ai') || content.includes('technology')) {
                finalCategory = 'Tech';
              } else if (title.includes('finance') || title.includes('bank') || content.includes('financial')) {
                finalCategory = 'Finance';
              }

              const article: InsertArticle = {
                title: item.title,
                slug: this.createSlug(item.title),
                content: item.description, // Full article content from RSS
                summary: item.description.length > 200 ? 
                  item.description.substring(0, 200) + '...' : 
                  item.description,
                category: finalCategory,
                authorName: source.name,
                featured: Math.random() > 0.8,
                tags: [finalCategory.toLowerCase(), 'news'],
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