import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ArticleModalProps {
  article: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [readingTime, setReadingTime] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Track reading time
      const timer = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
      return () => {
        document.body.style.overflow = 'unset';
        clearInterval(timer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      const scrollTop = e.target.scrollTop;
      const scrollHeight = e.target.scrollHeight - e.target.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    if (isOpen) {
      const modalContent = document.querySelector('.modal-content');
      modalContent?.addEventListener('scroll', handleScroll);
      return () => modalContent?.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } catch (error) {
      // Fallback for browsers without native sharing
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    // Track share
    fetch(`/api/articles/${article.id}/share`, { method: 'POST' });
  };

  const handleDiscuss = () => {
    // Open discussion section
    const discussionSection = document.querySelector('.discussion-section');
    if (discussionSection) {
      discussionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-60">
        <div 
          className="h-full bg-green-400 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-60 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
      >
        ✕
      </button>

      {/* Modal content */}
      <div className="modal-content h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-20">
          {/* Article header */}
          <div className="tech-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm font-mono">
                {article.category || 'NEWS'}
              </span>
              <span className="text-gray-400 text-sm">
                {new Date(article.publishedAt || article.published_at).toLocaleDateString()}
              </span>
              <span className="text-gray-400 text-sm">
                {article.authorName || article.author_name}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4 terminal-glow">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <span>📖</span>
                <span>Reading time: {calculateReadingTime(article.content)} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span>{article.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <span>{article.shareCount || 0} shares</span>
              </div>
            </div>

            {/* Article summary */}
            <div className="border-l-4 border-green-400 pl-4 mb-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                {article.summary}
              </p>
            </div>
          </div>

          {/* Article content */}
          <div className="tech-card p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          </div>

          {/* Article actions */}
          <div className="tech-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDiscuss}
                  className="px-4 py-2 bg-green-400/20 text-green-400 rounded hover:bg-green-400/30 transition-colors"
                >
                  💬 Discuss
                </button>
                <button 
                  onClick={handleShare}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  🔗 Share
                </button>

              </div>
              <div className="text-gray-400 text-sm">
                Stay on Coin Feedly for the latest updates
              </div>
            </div>
          </div>

          {/* Discussion section */}
          <div className="discussion-section tech-card p-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Discussion</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs text-black">A</span>
                  <span>Anonymous • 2 minutes ago</span>
                </div>
                <p className="text-gray-300">Great analysis! This aligns with what we're seeing in the broader market trends.</p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded">
                <textarea 
                  id="comment-input"
                  className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-green-400 focus:outline-none" 
                  placeholder="Share your thoughts on this article..."
                  rows={3}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('comment-input') as HTMLTextAreaElement;
                    if (input.value.trim()) {
                      const newComment = document.createElement('div');
                      newComment.className = 'p-4 bg-gray-800/50 rounded mb-4';
                      newComment.innerHTML = `
                        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <span class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs text-black">A</span>
                          <span>Anonymous • just now</span>
                        </div>
                        <p class="text-gray-300">${input.value}</p>
                      `;
                      input.parentElement?.parentElement?.insertBefore(newComment, input.parentElement);
                      input.value = '';
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-green-400 text-black rounded hover:bg-green-500 transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Related articles */}
          <div className="tech-card p-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Continue Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded">
                <h4 className="text-white font-medium mb-2">More Market News</h4>
                <p className="text-gray-400 text-sm">Stay updated with the latest financial data</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded">
                <h4 className="text-white font-medium mb-2">Crypto Analysis</h4>
                <p className="text-gray-400 text-sm">Deep dive into cryptocurrency trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}