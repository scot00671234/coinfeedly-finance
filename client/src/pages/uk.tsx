import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import type { Article } from "@shared/schema";

export default function UK() {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles?category=uk&limit=20'],
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">United Kingdom</h1>
          <p className="text-gray-600 text-lg">
            UK financial markets, Bank of England policy, and British business news
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {article.category.toUpperCase()}
                  </Badge>
                  <h3 className="font-bold text-lg mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.authorName}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(article.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {article.views}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No UK news articles available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}