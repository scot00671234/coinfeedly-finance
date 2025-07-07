import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(), // BREAKING, CRYPTO, STOCKS, COMMODITIES, EARNINGS
  imageUrl: text("image_url"),
  authorName: text("author_name").notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  featured: boolean("featured").default(false),
  tags: text("tags").array(),
  relatedSymbols: text("related_symbols").array(), // Stock/crypto symbols mentioned
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  change: decimal("change", { precision: 18, scale: 8 }).notNull(),
  changePercent: decimal("change_percent", { precision: 10, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  type: text("type").notNull(), // stock, crypto, commodity, index
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  metadata: jsonb("metadata"), // Additional data like 52-week high/low, etc.
});

export const newsEvents = pgTable("news_events", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(), // yahoo, coingecko, etc.
  publishedAt: timestamp("published_at").notNull(),
  symbols: text("symbols").array(), // Related symbols
  sentiment: text("sentiment"), // positive, negative, neutral
  processed: boolean("processed").default(false),
  articleId: integer("article_id"), // Generated article ID if processed
});

export const articlesRelations = relations(articles, ({ one }) => ({
  generatedFromEvent: one(newsEvents, {
    fields: [articles.id],
    references: [newsEvents.articleId],
  }),
}));

export const newsEventsRelations = relations(newsEvents, ({ one }) => ({
  generatedArticle: one(articles, {
    fields: [newsEvents.articleId],
    references: [articles.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  publishedAt: true,
  viewCount: true,
  shareCount: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  lastUpdated: true,
});

export const insertNewsEventSchema = createInsertSchema(newsEvents).omit({
  id: true,
  processed: true,
  articleId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type NewsEvent = typeof newsEvents.$inferSelect;
export type InsertNewsEvent = z.infer<typeof insertNewsEventSchema>;
