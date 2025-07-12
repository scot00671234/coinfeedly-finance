import { users, articles, marketData, newsEvents, type User, type InsertUser, type Article, type InsertArticle, type MarketData, type InsertMarketData, type NewsEvent, type InsertNewsEvent } from "@shared/schema";
import { db } from "./db";
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
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);
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
