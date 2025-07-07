import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

export default function Home() {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles?limit=50'],
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

  const featuredArticle = articles.find(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="border-b border-gray-200 pb-8 mb-8">
            <Link href={`/articles/${featuredArticle.id}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 cursor-pointer hover:opacity-90 transition-opacity">
                {featuredArticle.imageUrl && (
                  <div className="lg:order-2">
                    <img 
                      src={featuredArticle.imageUrl} 
                      alt={featuredArticle.title}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="lg:order-1 flex flex-col justify-center">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                      FEATURED
                    </span>
                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                      {featuredArticle.category}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredArticle.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="font-medium">{featuredArticle.authorName}</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeAgo(featuredArticle.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {featuredArticle.viewCount || 0} views
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.slice(0, 12).map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <article className="cursor-pointer group">
                {article.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-48 object-cover rounded group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-xs font-bold uppercase tracking-wide">
                      {article.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <span className="font-medium">{article.authorName}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {articles.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}