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
        category: "companies",
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
        category: "us",
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
        category: "tech",
        authorName: "David Park",
        publishedAt: new Date(Date.now() - 10800000),
        featured: true,
        tags: ["tesla", "battery", "electric-vehicles", "innovation"],
        relatedSymbols: ["TSLA"],
        views: 3200,
        shares: 125,
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=400&fit=crop"
      },
      {
        title: "Global Supply Chain Disruptions Impact Manufacturing Worldwide",
        content: "Manufacturing companies across the globe are facing unprecedented supply chain challenges, with delays and shortages affecting production schedules. The automotive and electronics sectors are particularly vulnerable to these disruptions.",
        summary: "Worldwide supply chain issues continue to challenge global manufacturing operations.",
        category: "world",
        authorName: "James Wilson",
        publishedAt: new Date(Date.now() - 14400000),
        featured: false,
        tags: ["supply-chain", "manufacturing", "global", "disruption"],
        relatedSymbols: [],
        views: 980,
        shares: 32,
        imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop"
      },
      {
        title: "Bank of England Maintains Interest Rates Amid Economic Uncertainty",
        content: "The Bank of England has decided to keep interest rates unchanged at 5.25% as policymakers assess the impact of previous rate increases on inflation and economic growth. The decision comes amid mixed economic signals across the UK.",
        summary: "BoE holds rates steady while monitoring inflation and economic indicators.",
        category: "uk",
        authorName: "Sophie Williams",
        publishedAt: new Date(Date.now() - 18000000),
        featured: false,
        tags: ["bank-of-england", "interest-rates", "uk-economy", "inflation"],
        relatedSymbols: ["GBP=X"],
        views: 1450,
        shares: 28,
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop"
      },
      {
        title: "Meta Unveils Next-Generation VR Headset with Advanced AI Features",
        content: "Meta has announced its latest virtual reality headset, featuring breakthrough AI capabilities and improved display technology. The device promises to revolutionize both gaming and professional applications in the metaverse.",
        summary: "Meta's new VR headset combines cutting-edge AI with enhanced immersive experiences.",
        category: "tech",
        authorName: "Alex Turner",
        publishedAt: new Date(Date.now() - 21600000),
        featured: false,
        tags: ["meta", "vr", "artificial-intelligence", "gaming"],
        relatedSymbols: ["META"],
        views: 2800,
        shares: 95,
        imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800&h=400&fit=crop"
      },
      {
        title: "Microsoft Announces Major Investment in Renewable Energy Infrastructure",
        content: "Microsoft Corporation revealed plans to invest $10 billion in renewable energy projects over the next five years. The initiative is part of the company's commitment to become carbon negative by 2030.",
        summary: "Microsoft commits $10B to renewable energy as part of carbon negative goals.",
        category: "companies",
        authorName: "Lisa Chang",
        publishedAt: new Date(Date.now() - 25200000),
        featured: false,
        tags: ["microsoft", "renewable-energy", "sustainability", "climate"],
        relatedSymbols: ["MSFT"],
        views: 1670,
        shares: 54,
        imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop"
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