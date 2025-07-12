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
      {/* New York Times Style Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Coin Feedly</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/crypto" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Crypto</Link>
                <Link href="/markets" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Markets</Link>
                <Link href="/companies" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Companies</Link>
                <Link href="/tech" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Technology</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Article - New York Times Style */}
        {featuredArticle && (
          <div className="border-b border-gray-200 pb-12 mb-12">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  FEATURED
                </span>
                <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                  {featuredArticle.category}
                </span>
              </div>
              <Link href={`/articles/${featuredArticle.slug || featuredArticle.id}`}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                  {featuredArticle.title}
                </h1>
              </Link>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-4xl">
                {featuredArticle.summary}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="font-medium">By {featuredArticle.authorName}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTimeAgo(featuredArticle.publishedAt)}
                </div>
              </div>
            </div>
            {featuredArticle.imageUrl && (
              <div className="mb-8">
                <img 
                  src={featuredArticle.imageUrl} 
                  alt={featuredArticle.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Article Grid - New York Times Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.slice(0, 9).map((article) => (
            <article key={article.id} className="group">
              <Link href={`/articles/${article.slug || article.id}`}>
                <div className="cursor-pointer">
                  {article.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-600 text-xs font-semibold uppercase tracking-wide">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{article.authorName}</span>
                      <div className="flex items-center space-x-4">
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