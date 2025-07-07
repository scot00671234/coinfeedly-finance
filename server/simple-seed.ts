import { storage } from "./storage.js";
import { InsertArticle, InsertMarketData } from "@shared/schema";

async function simpleSeed() {
  try {
    console.log("Starting simple database seeding...");

    // Create sample articles
    const sampleArticles: InsertArticle[] = [
      {
        title: "Bitcoin Surges Past $50,000 as Institutional Adoption Accelerates",
        content: "Bitcoin has reached new heights, surpassing the $50,000 milestone as institutional investors continue to embrace cryptocurrency as a legitimate asset class. This surge reflects growing confidence in digital assets among traditional financial institutions.",
        summary: "Bitcoin breaks through $50,000 barrier driven by institutional adoption and growing mainstream acceptance.",
        category: "crypto",
        authorName: "Sarah Johnson",
        publishedAt: new Date(),
        featured: true,
        tags: ["bitcoin", "cryptocurrency", "institutional", "adoption"],
        relatedSymbols: ["BTC-USD"],
        views: 1250,
        shares: 48,
        imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop"
      },
      {
        title: "Apple Reports Record Q4 Earnings, Stock Jumps 8% in After-Hours Trading",
        content: "Apple Inc. exceeded analyst expectations with record-breaking fourth-quarter earnings, reporting revenue of $94.9 billion. The company's strong performance across all product categories drove shares up 8% in after-hours trading.",
        summary: "Apple delivers exceptional Q4 results, beating expectations and driving significant stock gains.",
        category: "stocks",
        authorName: "Michael Chen",
        publishedAt: new Date(Date.now() - 3600000),
        featured: true,
        tags: ["apple", "earnings", "stocks", "technology"],
        relatedSymbols: ["AAPL"],
        views: 2100,
        shares: 75,
        imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=400&fit=crop"
      },
      {
        title: "Federal Reserve Signals Potential Interest Rate Cut as Inflation Cools",
        content: "The Federal Reserve indicated a possible interest rate reduction in the coming months as inflation continues to moderate. This dovish stance has sparked optimism across equity markets and could provide economic stimulus.",
        summary: "Fed hints at rate cuts as inflation trends downward, boosting market sentiment.",
        category: "economics",
        authorName: "Emily Rodriguez",
        publishedAt: new Date(Date.now() - 7200000),
        featured: false,
        tags: ["federal-reserve", "interest-rates", "inflation", "monetary-policy"],
        relatedSymbols: ["^GSPC", "^DJI"],
        views: 1800,
        shares: 62,
        imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop"
      },
      {
        title: "Tesla Unveils Revolutionary Battery Technology, Promises 1000-Mile Range",
        content: "Tesla announced breakthrough battery technology that could deliver over 1000 miles of range per charge. The new solid-state batteries represent a significant advancement in electric vehicle technology and could accelerate EV adoption.",
        summary: "Tesla's new battery tech promises unprecedented range, marking a major EV breakthrough.",
        category: "technology",
        authorName: "David Park",
        publishedAt: new Date(Date.now() - 10800000),
        featured: true,
        tags: ["tesla", "battery", "electric-vehicles", "innovation"],
        relatedSymbols: ["TSLA"],
        views: 3200,
        shares: 125,
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=400&fit=crop"
      }
    ];

    // Create sample market data
    const sampleMarketData: InsertMarketData[] = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 195.50,
        change: 8.75,
        changePercent: 4.69,
        volume: 45000000,
        marketCap: 3100000000000,
        currency: "USD",
        exchange: "NASDAQ",
        type: "stock"
      },
      {
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: 248.30,
        change: 12.45,
        changePercent: 5.28,
        volume: 38000000,
        marketCap: 790000000000,
        currency: "USD",
        exchange: "NASDAQ",
        type: "stock"
      },
      {
        symbol: "BTC-USD",
        name: "Bitcoin",
        price: 52500.00,
        change: 2100.00,
        changePercent: 4.17,
        volume: 28000000000,
        marketCap: 1030000000000,
        currency: "USD",
        exchange: "Crypto",
        type: "crypto"
      },
      {
        symbol: "ETH-USD",
        name: "Ethereum",
        price: 3200.00,
        change: 145.00,
        changePercent: 4.75,
        volume: 15000000000,
        marketCap: 385000000000,
        currency: "USD",
        exchange: "Crypto",
        type: "crypto"
      }
    ];

    // Insert articles
    for (const article of sampleArticles) {
      await storage.createArticle(article);
      console.log(`Created article: ${article.title}`);
    }

    // Insert market data
    for (const marketData of sampleMarketData) {
      await storage.upsertMarketData(marketData);
      console.log(`Created market data: ${marketData.symbol}`);
    }

    console.log("Simple database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

simpleSeed().catch(console.error);