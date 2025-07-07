import { useQuery } from "@tanstack/react-query";
import MarketTicker from "@/components/market/market-ticker";
import HeroSection from "@/components/common/hero-section";
import MarketOverview from "@/components/market/market-overview";
import FeaturedArticles from "@/components/articles/featured-articles";
import MarketDataTables from "@/components/market/market-data-tables";
import NewsletterSignup from "@/components/common/newsletter-signup";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Article, MarketData } from "@shared/schema";

export default function Home() {
  // Fetch featured articles
  const { data: featuredArticles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles?featured=true&limit=6'],
  });

  // Fetch market data
  const { data: marketData = [], isLoading: marketLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
  });

  // Fetch top gainers
  const { data: topGainers = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data/gainers?limit=5'],
  });

  // WebSocket connection for real-time updates
  useWebSocket();

  return (
    <div className="min-h-screen">
      <MarketTicker />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        
        <MarketOverview 
          marketData={marketData} 
          isLoading={marketLoading} 
        />
        
        <FeaturedArticles 
          articles={featuredArticles} 
          isLoading={articlesLoading} 
        />
        
        <MarketDataTables 
          topGainers={topGainers}
          cryptoData={marketData.filter(item => item.type === 'crypto')}
        />
        
        <NewsletterSignup />
      </div>
    </div>
  );
}
