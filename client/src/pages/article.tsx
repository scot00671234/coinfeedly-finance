import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Clock, Eye, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

export default function ArticlePage() {
  const [match, params] = useRoute('/articles/:identifier');
  const articleIdentifier = params?.identifier;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${articleIdentifier}`],
    enabled: !!articleIdentifier,
  });

  const formatTimeAgo = (date: string) => {
    if (!date) return 'Recently';
    
    const now = new Date();
    const articleDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(articleDate.getTime())) {
      return 'Recently';
    }
    
    const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return articleDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/">
            <span className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </span>
          </Link>
        </div>

        <article className="max-w-none">
          {/* Article header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-blue-600 text-sm font-bold uppercase tracking-wide">
                {article.category}
              </span>
              {article.featured && (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                  FEATURED
                </span>
              )}
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">By Coin Feedly</span>
                <span className="mx-3">•</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTimeAgo(article.publishedAt)}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {article.viewCount || 0} views
                </div>
                <button className="flex items-center hover:text-blue-600 transition-colors">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Article image */}
          {article.imageUrl && (
            <div className="mb-8">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed space-y-6">
              {article.content?.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Article tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}