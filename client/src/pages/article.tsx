import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Clock, Eye, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

export default function ArticlePage() {
  const [match, params] = useRoute('/article/:id');
  const articleId = params?.id;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
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
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/">
            <span className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </span>
          </Link>
        </div>

        {/* Article header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-8">
            {/* Category badge */}
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full uppercase">
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta information */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <span className="font-medium text-gray-900">By {article.authorName}</span>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTimeAgo(article.publishedAt)}
                </div>
                <div className="flex items-center text-gray-500">
                  <Eye className="h-4 w-4 mr-1" />
                  {article.views} views
                </div>
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                {article.summary}
              </p>
            </div>

            {/* Article content */}
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related symbols */}
            {article.relatedSymbols && article.relatedSymbols.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Symbols</h3>
                <div className="flex flex-wrap gap-2">
                  {article.relatedSymbols.map((symbol) => (
                    <span 
                      key={symbol}
                      className="bg-blue-100 text-blue-700 text-sm font-mono px-3 py-1 rounded"
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}