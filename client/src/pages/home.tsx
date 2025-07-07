import { useQuery } from "@tanstack/react-query";
import MarketTicker from "@/components/market/market-ticker";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, Eye } from "lucide-react";
import type { Article, MarketData } from "@shared/schema";

export default function Home() {
  // Fetch all articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles?limit=20'],
  });

  // Fetch market data
  const { data: marketData = [], isLoading: marketLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
  });

  // Fetch top gainers
  const { data: topGainers = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data/gainers?limit=8'],
  });

  // WebSocket connection for real-time updates
  useWebSocket();

  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);
  const mainArticle = featuredArticles[0];
  const heroArticles = featuredArticles.slice(1, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MarketTicker />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {!marketLoading && topGainers.slice(0, 3).map((stock) => (
                <div key={stock.id} className="text-sm">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {stock.symbol}
                  </div>
                  <div className={`flex items-center ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {formatPercent(stock.changePercent)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Featured Article */}
            <div className="lg:col-span-8">
              {mainArticle && (
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img 
                      src={mainArticle.imageUrl} 
                      alt={mainArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {mainArticle.category.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {mainArticle.authorName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        •
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(mainArticle.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link href={`/articles/${mainArticle.id}`}>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {mainArticle.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                      {mainArticle.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {mainArticle.views} views
                        </span>
                        <div className="flex space-x-1">
                          {mainArticle.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Link href={`/articles/${mainArticle.id}`}>
                        <span className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Read More →
                        </span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Secondary Articles */}
            <div className="lg:col-span-4 space-y-6">
              {heroArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    <div className="w-1/3 aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="w-2/3 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {article.category.toUpperCase()}
                        </Badge>
                      </div>
                      <Link href={`/articles/${article.id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{article.authorName}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Latest News Grid */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Latest News
            </h2>
            <Link href="/articles">
              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                View All Articles →
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.slice(0, 9).map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.category.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/articles/${article.id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{article.authorName}</span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {article.views}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Market Overview Sidebar */}
        <div className="py-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Market Movers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {topGainers.slice(0, 8).map((stock) => (
              <Card key={stock.id} className="p-3">
                <div className="text-center">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {formatCurrency(stock.price)}
                  </div>
                  <div className={`text-xs flex items-center justify-center ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {formatPercent(stock.changePercent)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
