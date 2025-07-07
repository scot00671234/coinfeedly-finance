import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

interface ArticleFeedProps {
  category?: string;
  title: string;
  description: string;
}

export default function ArticleFeed({ category, title, description }: ArticleFeedProps) {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: category ? [`/api/articles?category=${category}&limit=50`] : ['/api/articles?limit=50'],
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded uppercase">
                    {featuredArticle.category}
                  </span>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-500 text-xs font-semibold">FEATURED</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {featuredArticle.summary}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{featuredArticle.authorName}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimeAgo(featuredArticle.publishedAt)}
                    </div>
                    <span>{featuredArticle.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {regularArticles.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`}>
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded uppercase">
                    {article.category}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(article.publishedAt)}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{article.authorName}</span>
                  <span>{article.views} views</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {articles.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles available in this category at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}