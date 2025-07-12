import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp, Bitcoin, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

export default function Crypto() {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles?category=CRYPTO&limit=20'],
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white p-6 border border-gray-200 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center space-x-4 mb-6">
            <Bitcoin className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Cryptocurrency</h1>
          </div>
          <p className="text-xl text-orange-100">
            Latest crypto market trends, blockchain technology, and digital asset analysis
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.id} className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/articles/${article.slug || article.id}`}>
                <div className="cursor-pointer">
                  {article.imageUrl && (
                    <div className="overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                        CRYPTO
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span className="font-medium">{article.authorName}</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {article.viewCount || 0}
                        </span>
                        {article.relatedSymbols && article.relatedSymbols.length > 0 && (
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {article.relatedSymbols.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <Bitcoin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No crypto articles yet</h3>
            <p className="text-gray-600">Check back soon for the latest cryptocurrency news and analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}