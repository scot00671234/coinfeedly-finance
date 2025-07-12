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
        {/* Featured Article - Compact NYT Style */}
        {featuredArticle && (
          <div className="border-b border-gray-200 pb-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    FEATURED
                  </span>
                  <span className="text-blue-600 text-xs font-semibold uppercase tracking-wide">
                    {featuredArticle.category}
                  </span>
                </div>
                <Link href={`/articles/${featuredArticle.slug || featuredArticle.id}`}>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                    {featuredArticle.title}
                  </h1>
                </Link>
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                  {featuredArticle.summary}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">By {featuredArticle.authorName}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimeAgo(featuredArticle.publishedAt)}
                  </div>
                </div>
              </div>
              {featuredArticle.imageUrl && (
                <div className="order-1 lg:order-2">
                  <img 
                    src={featuredArticle.imageUrl} 
                    alt={featuredArticle.title}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Stories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-900 pb-2">
            Top Stories
          </h2>
          
          {/* Main Grid - NYT Style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Primary Stories */}
            <div className="lg:col-span-2 space-y-6">
              {regularArticles.slice(0, 3).map((article, index) => (
                <article key={article.id} className="group border-b border-gray-200 pb-6">
                  <Link href={`/articles/${article.slug || article.id}`}>
                    <div className="cursor-pointer">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {article.imageUrl && (
                          <div className="md:col-span-1">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-32 md:h-24 object-cover rounded"
                            />
                          </div>
                        )}
                        <div className={`${article.imageUrl ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wide">
                              {article.category}
                            </span>
                            <span className="text-xs text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                          </div>
                          <h2 className={`${index === 0 ? 'text-2xl' : 'text-xl'} font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight`}>
                            {article.title}
                          </h2>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="font-medium">{article.authorName}</span>
                            <span className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {article.viewCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            
            {/* Right Column - Secondary Stories */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Most Popular
                </h3>
                {regularArticles.slice(3, 8).map((article, index) => (
                  <article key={article.id} className="group py-3 border-b border-gray-200 last:border-b-0">
                    <Link href={`/articles/${article.slug || article.id}`}>
                      <div className="cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <span className="text-lg font-bold text-gray-400 mt-1">
                            {index + 1}
                          </span>
                          <div className="flex-1 space-y-1">
                            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wide">
                              {article.category}
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {article.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{formatTimeAgo(article.publishedAt)}</span>
                              <span>•</span>
                              <span>{article.viewCount || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* More Articles Link */}
        <div className="mt-12 text-center">
          <Link href="/articles">
            <span className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              View All Articles
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}