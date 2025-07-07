import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@shared/schema";

interface FeaturedArticlesProps {
  articles: Article[];
  isLoading: boolean;
}

export default function FeaturedArticles({ articles, isLoading }: FeaturedArticlesProps) {
  const formatTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BREAKING':
        return 'bg-red-600 text-white';
      case 'CRYPTO':
        return 'bg-yellow-600 text-white';
      case 'STOCKS':
        return 'bg-green-600 text-white';
      case 'COMMODITIES':
        return 'bg-gray-600 text-white';
      case 'EARNINGS':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Featured Articles</h3>
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="w-full h-48" />
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const leadArticles = articles.slice(0, 2);
  const smallerArticles = articles.slice(2, 5);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Featured Articles</h3>
        <Link href="/articles">
          <span className="text-primary hover:text-blue-700 font-medium cursor-pointer">
            View All Articles
          </span>
        </Link>
      </div>
      
      {/* Lead Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {leadArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-200 overflow-hidden">
              {article.imageUrl ? (
                <img 
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={getCategoryColor(article.category)}>
                  {article.category}
                </Badge>
                <span className="text-gray-500 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTimeAgo(article.publishedAt)}
                </span>
              </div>
              
              <Link href={`/articles/${article.id}`}>
                <h4 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors cursor-pointer">
                  {article.title}
                </h4>
              </Link>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {article.authorName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{article.authorName}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {article.viewCount || 0}
                  </span>
                  <span className="flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    {article.shareCount || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Smaller Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {smallerArticles.map((article) => (
          <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-2 mb-3">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <span className="text-gray-500 text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTimeAgo(article.publishedAt)}
              </span>
            </div>
            
            <Link href={`/articles/${article.id}`}>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 hover:text-primary transition-colors cursor-pointer">
                {article.title}
              </h4>
            </Link>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{article.authorName}</span>
              <span>{article.viewCount || 0} views</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
