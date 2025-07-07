import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Eye, DollarSign } from "lucide-react";
import type { Article, MarketData } from "@shared/schema";

export default function Markets() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles?category=markets&limit=20'],
  });

  const { data: marketData = [], isLoading: marketLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
  });

  const { data: topGainers = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data/gainers?limit=6'],
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="outline" className="text-sm font-bold">
              <DollarSign className="h-3 w-3 mr-1" />
              MARKETS
            </Badge>
            <span className="text-gray-600 text-sm">Live Data</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Market News & Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time market movements, earnings reports, and trading insights
          </p>
        </div>

        {/* Market Overview Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Market Movers</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topGainers.slice(0, 6).map((asset) => (
              <div key={asset.symbol} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{asset.symbol}</div>
                <div className="font-semibold text-sm">${Number(asset.price).toFixed(2)}</div>
                <div className={`text-xs flex items-center justify-center ${
                  Number(asset.change) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Number(asset.change) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Number(asset.changePercent).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main News Column */}
          <div className="lg:col-span-3">
            {/* Featured Story */}
            {featuredArticles.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img 
                    src={featuredArticles[0].imageUrl} 
                    alt={featuredArticles[0].title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <Badge variant="outline" className="mb-3">
                      FEATURED MARKET NEWS
                    </Badge>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {featuredArticles[0].title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {featuredArticles[0].summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {featuredArticles[0].authorName}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(featuredArticles[0].publishedAt)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {featuredArticles[0].views}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market News Grid */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                Latest Market News
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(featuredArticles.length > 1 ? featuredArticles.slice(1) : []).concat(regularArticles).map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        MARKETS
                      </Badge>
                      <h3 className="font-bold text-lg mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{article.authorName}</span>
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!articlesLoading && articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No market news articles available at the moment.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Market Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Market Summary</h3>
              <div className="space-y-3">
                {topGainers.slice(0, 5).map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{asset.symbol}</div>
                      <div className="text-xs text-gray-500">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">${Number(asset.price).toFixed(2)}</div>
                      <div className={`text-xs ${
                        Number(asset.change) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Number(asset.change) >= 0 ? '+' : ''}{Number(asset.changePercent).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">Market Trends</h3>
              <div className="space-y-2">
                {['Earnings Season', 'Fed Policy', 'Tech Earnings', 'Energy Sector', 'Banking Updates'].map((trend) => (
                  <div key={trend} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium">{trend}</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}