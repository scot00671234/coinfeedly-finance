import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Share2 } from "lucide-react";
import type { Article } from "@shared/schema";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors line-clamp-2 cursor-pointer">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
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
  );
}
