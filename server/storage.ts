import { users, articles, marketData, newsEvents, type User, type InsertUser, type Article, type InsertArticle, type MarketData, type InsertMarketData, type NewsEvent, type InsertNewsEvent } from "@shared/schema";
import { db } from "./database";
import { eq, desc, and, inArray, sql, or, like } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Articles
  getArticles(limit?: number, offset?: number): Promise<Article[]>;
  getFeaturedArticles(limit?: number): Promise<Article[]>;
  getArticlesByCategory(category: string, limit?: number): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticleViews(id: number): Promise<void>;
  updateArticleViewsBySlug(slug: string): Promise<void>;
  updateArticleShares(id: number): Promise<void>;
  searchArticles(query: string, limit?: number): Promise<Article[]>;
  
  // Market Data
  getMarketData(symbols?: string[]): Promise<MarketData[]>;
  getMarketDataByType(type: string): Promise<MarketData[]>;
  upsertMarketData(data: InsertMarketData): Promise<MarketData>;
  getTopGainers(limit?: number): Promise<MarketData[]>;
  getTopLosers(limit?: number): Promise<MarketData[]>;
  
  // News Events
  getUnprocessedNewsEvents(): Promise<NewsEvent[]>;
  createNewsEvent(event: InsertNewsEvent): Promise<NewsEvent>;
  markNewsEventProcessed(id: number, articleId: number): Promise<void>;
  getRecentNewsEvents(limit?: number): Promise<NewsEvent[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Articles
  async getArticles(limit = 50, offset = 0): Promise<Article[]> {
    try {
      return await db
        .select()
        .from(articles)
        .orderBy(desc(articles.publishedAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.log('📰 Using sample articles (database unavailable)');
      return this.getSampleArticles();
    }
  }

  private getSampleArticles(): Article[] {
    return [
      {
        id: 1,
        title: 'Bitcoin Reaches New Heights as Institutional Adoption Accelerates',
        slug: 'bitcoin-reaches-new-heights-institutional-adoption',
        content: 'Bitcoin has surged to impressive levels as major financial institutions continue to embrace cryptocurrency. The digital asset\'s recent performance reflects growing confidence from institutional investors and improved regulatory clarity across global markets. This momentum is expected to continue as more traditional finance players enter the crypto space.',
        summary: 'Bitcoin surges as institutional investors drive adoption and regulatory clarity improves.',
        category: 'Crypto',
        authorName: 'CoinTelegraph',
        publishedAt: new Date(Date.now() - 60000),
        imageUrl: null,
        featured: true,
        tags: ['bitcoin', 'crypto', 'institutional'],
        relatedSymbols: ['BTC', 'ETH'],
        viewCount: 1247,
        shareCount: 89
      },
      {
        id: 2,
        title: 'Federal Reserve Hints at Policy Shifts Amid Economic Data',
        slug: 'federal-reserve-hints-policy-shifts-economic-data',
        content: 'The Federal Reserve has signaled potential adjustments to monetary policy following the latest economic indicators. Recent data showing moderated inflation and stable employment has provided the central bank with more flexibility in its decision-making process.',
        summary: 'Fed considers policy adjustments as economic indicators show positive trends.',
        category: 'Markets',
        authorName: 'Bloomberg',
        publishedAt: new Date(Date.now() - 120000),
        imageUrl: null,
        featured: false,
        tags: ['fed', 'policy', 'markets'],
        relatedSymbols: ['SPY', 'QQQ'],
        viewCount: 892,
        shareCount: 45
      },
      {
        id: 3,
        title: 'Tech Sector Demonstrates Resilience in Latest Earnings Reports',
        slug: 'tech-sector-demonstrates-resilience-latest-earnings',
        content: 'Technology companies have delivered stronger-than-expected earnings results, showcasing the sector\'s ability to navigate challenging economic conditions. Cloud computing and AI initiatives continue to drive growth.',
        summary: 'Tech companies exceed earnings expectations driven by cloud and AI growth.',
        category: 'Tech',
        authorName: 'TechCrunch',
        publishedAt: new Date(Date.now() - 180000),
        imageUrl: null,
        featured: true,
        tags: ['tech', 'earnings', 'ai'],
        relatedSymbols: ['AAPL', 'MSFT'],
        viewCount: 654,
        shareCount: 32
      },
      {
        id: 4,
        title: 'Ethereum Network Upgrade Enhances Transaction Efficiency',
        slug: 'ethereum-network-upgrade-enhances-transaction-efficiency',
        content: 'The latest Ethereum network upgrade has successfully improved transaction processing speeds and reduced costs for users. This enhancement represents a significant step forward in blockchain scalability.',
        summary: 'Ethereum upgrade improves transaction speeds and reduces costs for users.',
        category: 'Crypto',
        authorName: 'CoinDesk',
        publishedAt: new Date(Date.now() - 240000),
        imageUrl: null,
        featured: false,
        tags: ['ethereum', 'upgrade', 'scalability'],
        relatedSymbols: ['ETH', 'BTC'],
        viewCount: 445,
        shareCount: 28
      },
      {
        id: 5,
        title: 'Global Supply Chain Improvements Support Market Optimism',
        slug: 'global-supply-chain-improvements-support-market-optimism',
        content: 'International supply chain networks have shown marked improvement, with shipping delays decreasing and costs stabilizing. This positive development is providing relief to businesses across various sectors.',
        summary: 'Supply chain improvements boost business confidence and market sentiment.',
        category: 'Markets',
        authorName: 'Reuters',
        publishedAt: new Date(Date.now() - 300000),
        imageUrl: null,
        featured: false,
        tags: ['supply-chain', 'global', 'business'],
        relatedSymbols: ['SPY', 'DJI'],
        viewCount: 321,
        shareCount: 15
      }
    ];
  }

  async getFeaturedArticles(limit = 10): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.featured, true))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  async getArticlesByCategory(category: string, limit = 20): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.category, category))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug));
    return article || undefined;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db
      .insert(articles)
      .values(article)
      .returning();
    return newArticle;
  }

  async updateArticleViews(id: number): Promise<void> {
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, id));
  }

  async updateArticleViewsBySlug(slug: string): Promise<void> {
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.slug, slug));
  }

  async updateArticleShares(id: number): Promise<void> {
    await db
      .update(articles)
      .set({ shareCount: sql`${articles.shareCount} + 1` })
      .where(eq(articles.id, id));
  }

  async searchArticles(query: string, limit = 20): Promise<Article[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(articles)
      .where(
        or(
          like(articles.title, searchTerm),
          like(articles.content, searchTerm),
          like(articles.summary, searchTerm)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  // Market Data
  async getMarketData(symbols?: string[]): Promise<MarketData[]> {
    if (symbols && symbols.length > 0) {
      return await db
        .select()
        .from(marketData)
        .where(inArray(marketData.symbol, symbols))
        .orderBy(desc(marketData.lastUpdated));
    }
    return await db
      .select()
      .from(marketData)
      .orderBy(desc(marketData.lastUpdated));
  }

  async getMarketDataByType(type: string): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .where(eq(marketData.type, type))
      .orderBy(desc(marketData.lastUpdated));
  }

  async upsertMarketData(data: InsertMarketData): Promise<MarketData> {
    const [existing] = await db
      .select()
      .from(marketData)
      .where(eq(marketData.symbol, data.symbol));

    if (existing) {
      const [updated] = await db
        .update(marketData)
        .set({ 
          ...data, 
          lastUpdated: sql`NOW()` 
        })
        .where(eq(marketData.symbol, data.symbol))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(marketData)
        .values(data)
        .returning();
      return created;
    }
  }

  async getTopGainers(limit = 10): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .orderBy(desc(marketData.changePercent))
      .limit(limit);
  }

  async getTopLosers(limit = 10): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .orderBy(marketData.changePercent)
      .limit(limit);
  }

  // News Events
  async getUnprocessedNewsEvents(): Promise<NewsEvent[]> {
    return await db
      .select()
      .from(newsEvents)
      .where(eq(newsEvents.processed, false))
      .orderBy(desc(newsEvents.publishedAt));
  }

  async createNewsEvent(event: InsertNewsEvent): Promise<NewsEvent> {
    const [newEvent] = await db
      .insert(newsEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async markNewsEventProcessed(id: number, articleId: number): Promise<void> {
    await db
      .update(newsEvents)
      .set({ processed: true, articleId })
      .where(eq(newsEvents.id, id));
  }

  async getRecentNewsEvents(limit = 20): Promise<NewsEvent[]> {
    return await db
      .select()
      .from(newsEvents)
      .orderBy(desc(newsEvents.publishedAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
