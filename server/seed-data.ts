import { db } from './db';
import { articles, newsEvents } from '@shared/schema';
import { articleGenerator } from './services/article-generator';

const sampleNewsEvents = [
  {
    headline: "Bitcoin Surges Past $50,000 as Institutional Adoption Accelerates",
    summary: "Bitcoin reached a new milestone as it crossed the $50,000 threshold, driven by increased institutional investment and growing acceptance of cryptocurrency as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, signaling a paradigm shift in how digital assets are perceived in traditional finance.",
    source: "market-analysis",
    publishedAt: new Date(),
    symbols: ["BTC", "ETH"]
  },
  {
    headline: "Apple Reports Record Q4 Earnings, Stock Jumps 8% in After-Hours Trading",
    summary: "Apple Inc. exceeded Wall Street expectations with quarterly revenue of $119.6 billion, driven by strong iPhone sales and services growth. The tech giant also announced a $90 billion share buyback program, sending shares higher in extended trading. CEO Tim Cook highlighted the company's strong position in emerging markets.",
    source: "earnings-report",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    symbols: ["AAPL"]
  },
  {
    headline: "Tesla Unveils Revolutionary Battery Technology, Promises 1000-Mile Range",
    summary: "Tesla announced breakthrough battery technology that could enable electric vehicles to travel over 1000 miles on a single charge. The new solid-state battery design reduces charging time by 80% and increases energy density significantly. The technology is expected to enter production by 2026.",
    source: "tech-innovation",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    symbols: ["TSLA"]
  },
  {
    headline: "Federal Reserve Signals Potential Interest Rate Cut as Inflation Cools",
    summary: "The Federal Reserve indicated a possible interest rate reduction in the coming months as inflation data shows continued cooling. Fed Chair Jerome Powell emphasized the central bank's commitment to supporting economic growth while maintaining price stability. Markets rallied on the dovish signals.",
    source: "federal-reserve",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    symbols: ["SPY", "QQQ"]
  },
  {
    headline: "Oil Prices Surge 15% as OPEC+ Announces Production Cuts",
    summary: "Crude oil prices jumped dramatically following OPEC+ announcement of significant production cuts totaling 2 million barrels per day. The decision aims to stabilize global oil markets amid concerns about economic slowdown. Energy stocks led market gains as investors positioned for higher oil prices.",
    source: "commodities",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    symbols: ["USO", "XLE"]
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create news events and generate articles
    for (const eventData of sampleNewsEvents) {
      // Create news event
      const [newsEvent] = await db
        .insert(newsEvents)
        .values(eventData)
        .returning();
      
      console.log(`Created news event: ${newsEvent.headline}`);
      
      // Generate article using AI
      const article = await articleGenerator.generateArticle(newsEvent);
      
      if (article) {
        const [createdArticle] = await db
          .insert(articles)
          .values(article)
          .returning();
        
        // Mark news event as processed
        await db
          .update(newsEvents)
          .set({ processed: true, articleId: createdArticle.id })
          .where({ id: newsEvent.id });
        
        console.log(`Generated article: ${createdArticle.title}`);
      } else {
        console.log(`Failed to generate article for: ${newsEvent.headline}`);
      }
      
      // Wait a bit between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };