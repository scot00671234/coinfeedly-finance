import { db } from './db';
import { articles } from '@shared/schema';

const sampleArticles = [
  {
    title: "Bitcoin Surges Past $50,000 as Institutional Adoption Accelerates",
    slug: "bitcoin-surges-past-50000-institutional-adoption",
    summary: "Bitcoin crossed the $50,000 threshold driven by institutional investment and growing acceptance as a store of value. Major corporations continue adding Bitcoin to treasury reserves.",
    content: `Bitcoin has reached a significant milestone by crossing the $50,000 threshold, marking a pivotal moment in the cryptocurrency's journey toward mainstream acceptance. The surge comes as major corporations continue to add Bitcoin to their treasury reserves, signaling a fundamental shift in how digital assets are perceived within traditional finance.

The recent price action has been driven by several key factors. Institutional investors, including pension funds and insurance companies, have begun allocating portions of their portfolios to Bitcoin as a hedge against inflation and currency debasement. This institutional adoption has provided a strong foundation for Bitcoin's price appreciation, with many analysts viewing this as a validation of Bitcoin's store of value proposition.

Major corporations have played a crucial role in this rally. Companies like MicroStrategy, Tesla, and Square have made significant Bitcoin purchases, setting a precedent for other corporations to follow. These moves have not only increased demand for Bitcoin but have also demonstrated its viability as a corporate treasury asset.

The regulatory environment has also become more favorable, with clearer guidelines from financial authorities providing institutions with the confidence to enter the Bitcoin market. The approval of Bitcoin ETFs in various jurisdictions has further facilitated institutional access to the cryptocurrency market.

Market analysts predict that this trend will continue, with Bitcoin potentially reaching new all-time highs in the coming months. The combination of limited supply, increasing institutional demand, and growing acceptance of Bitcoin as a legitimate asset class creates a compelling case for continued price appreciation.

However, investors should remain cautious of Bitcoin's inherent volatility. While the long-term outlook appears positive, short-term price movements can be significant, and investors should consider their risk tolerance before making investment decisions.`,
    category: "cryptocurrency",
    tags: ["Bitcoin", "Cryptocurrency", "Institutional Investment", "Market Analysis"],
    authorName: "Michael Chen",
    publishedAt: new Date(),
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1518544866330-4e3cd06b2065?auto=format&fit=crop&w=800&q=80",
    relatedSymbols: ["BTC", "ETH"]
  },
  {
    title: "Apple Reports Record Q4 Earnings, Stock Jumps 8% in After-Hours Trading",
    slug: "apple-record-q4-earnings-stock-jumps-8-percent",
    summary: "Apple exceeded expectations with $119.6 billion in quarterly revenue, driven by strong iPhone sales and services growth. The company announced a $90 billion share buyback program.",
    content: `Apple Inc. exceeded Wall Street expectations with quarterly revenue of $119.6 billion, marking another record-breaking performance for the tech giant. The company's strong financial results sent shares soaring 8% in after-hours trading, reflecting investor confidence in Apple's continued growth trajectory.

The stellar performance was primarily driven by robust iPhone sales, which reached $71.8 billion in revenue for the quarter. The iPhone 15 series, launched earlier this year, has been particularly well-received by consumers, with its enhanced camera capabilities and improved battery life driving strong demand across all markets.

Apple's services segment also showed impressive growth, generating $22.3 billion in revenue. The services division, which includes the App Store, Apple Music, and iCloud, has become increasingly important to Apple's business model, providing a steady stream of recurring revenue and higher profit margins compared to hardware sales.

CEO Tim Cook highlighted the company's strong performance in emerging markets, particularly in India and Southeast Asia, where Apple has been investing heavily in retail expansion and local manufacturing. "Our results demonstrate the strength of our ecosystem and the loyalty of our customers worldwide," Cook stated during the earnings call.

The company also announced a massive $90 billion share buyback program, the largest in Apple's history. This move is expected to provide additional support for the stock price and return significant value to shareholders. The buyback program reflects Apple's confidence in its future prospects and its commitment to returning capital to investors.

Apple's guidance for the upcoming quarter was also optimistic, with the company expecting continued growth across all product categories. The holiday season is typically Apple's strongest quarter, and early indicators suggest strong demand for the company's latest products.

Despite the positive results, some analysts expressed concerns about potential headwinds, including increased competition in the smartphone market and potential supply chain disruptions. However, Apple's strong brand loyalty and innovative product pipeline position the company well for continued success.`,
    category: "technology",
    tags: ["Apple", "Earnings", "iPhone", "Technology", "Stock Market"],
    authorName: "Sarah Johnson",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80",
    relatedSymbols: ["AAPL"]
  },
  {
    title: "Tesla Unveils Revolutionary Battery Technology, Promises 1000-Mile Range",
    slug: "tesla-revolutionary-battery-technology-1000-mile-range",
    summary: "Tesla announced revolutionary solid-state battery technology enabling 1000-mile range and 80% faster charging. The technology is expected to enter production by 2026.",
    content: `Tesla has announced a groundbreaking advancement in battery technology that could revolutionize the electric vehicle industry. The company's new solid-state battery design promises to deliver over 1000 miles of range on a single charge while reducing charging time by 80%.

The breakthrough comes from Tesla's research and development teams, who have been working on solid-state battery technology for several years. Unlike traditional lithium-ion batteries, solid-state batteries use a solid electrolyte instead of a liquid one, resulting in higher energy density, improved safety, and faster charging capabilities.

During a presentation at Tesla's Austin facility, CEO Elon Musk demonstrated the new battery technology's capabilities. The solid-state batteries can store 50% more energy than current lithium-ion batteries while maintaining the same physical size. This increased energy density directly translates to extended driving range for Tesla vehicles.

The charging speed improvements are equally impressive. The new batteries can be charged from 10% to 80% in just 15 minutes using Tesla's upgraded Supercharger network. This dramatic reduction in charging time addresses one of the primary concerns consumers have about electric vehicles - range anxiety and charging inconvenience.

Tesla's battery innovation is expected to have significant implications for the broader electric vehicle market. The company plans to begin production of the new batteries at its Nevada Gigafactory, with the first vehicles featuring the technology expected to roll off production lines by 2026.

The announcement has sent ripples through the automotive industry, with competitors scrambling to develop their own solid-state battery solutions. Traditional automakers like Ford, General Motors, and Volkswagen have all increased their investments in battery technology in response to Tesla's breakthrough.

Industry analysts believe this development could accelerate the adoption of electric vehicles globally. The combination of extended range and faster charging addresses two of the main barriers to EV adoption, potentially making electric vehicles more attractive to mainstream consumers.

Tesla's stock price has responded positively to the announcement, with shares gaining 12% in trading following the battery technology reveal. Investors view the breakthrough as a significant competitive advantage that could help Tesla maintain its leadership position in the electric vehicle market.`,
    category: "technology",
    tags: ["Tesla", "Battery Technology", "Electric Vehicles", "Innovation", "Automotive"],
    authorName: "David Rodriguez",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
    relatedSymbols: ["TSLA"]
  },
  {
    title: "Federal Reserve Signals Potential Interest Rate Cut as Inflation Cools",
    slug: "federal-reserve-signals-interest-rate-cut-inflation-cools",
    summary: "The Federal Reserve indicated possible interest rate reductions as inflation data shows continued cooling. Fed Chair Powell emphasized commitment to supporting economic growth.",
    content: `The Federal Reserve has indicated a possible interest rate reduction in the coming months as recent inflation data shows continued cooling across the economy. Fed Chair Jerome Powell's comments during the latest Federal Open Market Committee meeting have provided markets with dovish signals, leading to widespread rallies across equity markets.

The Consumer Price Index (CPI) for the most recent month showed inflation cooling to 3.2% year-over-year, down from 3.7% in the previous month. This marks the sixth consecutive month of declining inflation, bringing the rate closer to the Federal Reserve's target of 2%. Core inflation, which excludes volatile food and energy prices, also declined to 4.1%.

Powell emphasized the Federal Reserve's commitment to supporting economic growth while maintaining price stability. "We are encouraged by the progress we've seen in bringing inflation down, and we remain committed to our dual mandate of maximum employment and price stability," Powell stated during the press conference.

The potential for rate cuts has been welcomed by businesses and consumers alike. Lower interest rates would reduce borrowing costs for companies looking to expand operations and for consumers seeking mortgages or other loans. This could provide additional stimulus to economic growth at a time when some sectors are showing signs of slowing.

Financial markets have responded positively to the Fed's dovish stance. The S&P 500 gained 2.1% following Powell's comments, while the Nasdaq Composite rose 2.8%. Bond yields fell across the curve, with the 10-year Treasury yield dropping to 4.2% from 4.5% earlier in the week.

However, some economists caution that the Fed should remain vigilant about inflation risks. While recent data has been encouraging, they argue that premature rate cuts could reignite inflationary pressures. The Fed has previously indicated that it prefers to see sustained progress on inflation before making significant policy changes.

The labor market remains strong, with unemployment at historic lows and job creation continuing at a steady pace. This gives the Fed flexibility in its policy decisions, as it doesn't face immediate pressure to stimulate employment growth.

Market participants will be closely watching upcoming economic data releases and Fed communications for further guidance on the timing and magnitude of potential rate cuts. Current market pricing suggests a high probability of at least one rate cut in the next six months.`,
    category: "economics",
    tags: ["Federal Reserve", "Interest Rates", "Inflation", "Economic Policy", "Jerome Powell"],
    authorName: "Jennifer Williams",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    relatedSymbols: ["SPY", "QQQ"]
  },
  {
    title: "Oil Prices Surge 15% as OPEC+ Announces Production Cuts",
    slug: "oil-prices-surge-15-percent-opec-production-cuts",
    summary: "Crude oil prices jumped 15% following OPEC+ announcement of 2 million barrels per day production cuts. Energy stocks led market gains as investors positioned for higher prices.",
    content: `Crude oil prices jumped dramatically following OPEC+'s announcement of significant production cuts totaling 2 million barrels per day. The decision, reached during an emergency meeting in Vienna, aims to stabilize global oil markets amid concerns about economic slowdown and weakening demand.

Brent crude, the international benchmark, surged 15.2% to $89.45 per barrel, while West Texas Intermediate (WTI) crude rose 14.8% to $83.12 per barrel. The sharp price increases represent the largest single-day gains for oil prices in over a year.

The production cuts, which will take effect starting next month, represent approximately 2% of global oil supply. OPEC+ members, led by Saudi Arabia and Russia, cited the need to maintain market stability and support oil prices in the face of uncertainty about global economic growth.

"This decision reflects our commitment to maintaining market stability and ensuring adequate supply for consumers while supporting the livelihoods of oil-producing nations," said Saudi Energy Minister Prince Abdulaziz bin Salman during the press conference following the meeting.

The announcement has sent shockwaves through energy markets, with oil and gas companies seeing significant stock price increases. ExxonMobil gained 8.3%, Chevron rose 7.9%, and ConocoPhillips jumped 9.1%. The Energy Select Sector SPDR Fund (XLE) was among the best-performing sectors, gaining 8.7%.

The production cuts come at a time when global oil demand has been showing signs of weakness due to concerns about economic growth in major economies. Recent data from China, the world's largest oil importer, showed slower industrial activity, while European demand has been impacted by high energy costs and economic uncertainty.

However, the timing of the cuts has raised concerns about their impact on global inflation. Higher oil prices could contribute to renewed inflationary pressures, particularly in countries that are heavily dependent on oil imports. This could complicate monetary policy decisions for central banks that have been working to bring inflation under control.

The Biden administration has expressed concern about the production cuts, with officials stating that they are considering all options to ensure adequate energy supplies for American consumers. The strategic petroleum reserve could potentially be used to help moderate price increases, though officials have not confirmed any specific plans.

Market analysts are divided on the long-term impact of the production cuts. Some believe that the cuts are necessary to maintain market stability and prevent a collapse in oil prices, while others argue that they could exacerbate inflationary pressures and slow economic growth.`,
    category: "commodities",
    tags: ["Oil Prices", "OPEC", "Energy", "Commodities", "Market Analysis"],
    authorName: "Robert Kim",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?auto=format&fit=crop&w=800&q=80",
    relatedSymbols: ["USO", "XLE"]
  }
];

async function createSampleArticles() {
  try {
    console.log('Creating sample articles...');
    
    for (const articleData of sampleArticles) {
      const [article] = await db
        .insert(articles)
        .values(articleData)
        .returning();
      
      console.log(`Created article: ${article.title}`);
    }
    
    console.log('Sample articles created successfully!');
  } catch (error) {
    console.error('Error creating sample articles:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleArticles().then(() => process.exit(0));
}

export { createSampleArticles };