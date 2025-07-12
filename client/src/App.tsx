import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import ArticleModal from './components/ArticleModal';

const queryClient = new QueryClient();

// Real-time feed item component with user retention features
function FeedItem({ item, onReadFull }: { item: any; onReadFull: (item: any) => void }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }, [item.id]);

  const handleReadFull = () => {
    onReadFull(item);
  };

  return (
    <div className={cn(
      "border-l-2 border-gray-800 pl-4 py-3 transition-all duration-300 cursor-pointer hover:bg-gray-900/50 hover:border-l-green-400",
      isNew && "border-l-green-400 bg-green-900/10"
    )} onClick={handleReadFull}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span className="px-2 py-1 bg-gray-800 rounded text-green-400">
              {item.category || 'NEWS'}
            </span>
            <span>{new Date(item.publishedAt || item.published_at).toLocaleTimeString()}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{item.authorName || item.author_name}</span>
          </div>
          <h3 className="text-white font-medium mb-2 leading-tight hover:text-green-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {item.summary}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span className="hover:text-green-400 transition-colors">
              📖 Read Full Article
            </span>
            <span>👁️ {item.viewCount || 0} views</span>
            <span>🔗 {item.shareCount || 0} shares</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isNew && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
          <div className="text-green-400 text-xs font-mono">
            READ →
          </div>
        </div>
      </div>
    </div>
  );
}

// Main feed component with user retention features
function LiveFeed() {
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['feed', page],
    queryFn: async () => {
      const response = await fetch(`/api/articles?limit=20&offset=${(page - 1) * 20}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle infinite scroll
  useEffect(() => {
    if (articles.length > 0) {
      if (page === 1) {
        setAllArticles(articles);
      } else {
        setAllArticles(prev => [...prev, ...articles]);
      }
      setHasMore(articles.length === 20);
      setIsLoadingMore(false);
    }
  }, [articles, page]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore]);

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    // WebSocket connection for real-time updates
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}`);
      
      ws.onopen = () => setConnectionStatus('connected');
      ws.onclose = () => setConnectionStatus('disconnected');
      ws.onerror = () => setConnectionStatus('disconnected');

      return () => ws.close();
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  }, []);

  // Track reading time for user engagement
  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReadFull = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    // Track article views
    fetch(`/api/articles/${article.id}/view`, { method: 'POST' }).catch(() => {});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-400 text-sm animate-pulse">
          <div className="scanning-line">Loading financial data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Unable to load articles</div>
        <div className="text-gray-400 text-sm">
          RSS feeds are being processed. Please check back in a few minutes.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-green-400 mb-2">🔄 SYSTEM INITIALIZING</div>
            <div className="text-sm">Financial data streams coming online...</div>
          </div>
        ) : (
          <>
            {allArticles.map((item: any) => (
              <FeedItem 
                key={item.id} 
                item={item} 
                onReadFull={handleReadFull}
              />
            ))}
            {isLoadingMore && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-green-400 mb-2">🔄 LOADING MORE</div>
                <div className="text-sm">Fetching additional articles...</div>
              </div>
            )}
          </>
        )}
      </div>
      
      <ArticleModal 
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

// Enhanced status bar with user engagement metrics
function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [activeUsers, setActiveUsers] = useState(147); // Simulated active users
  const [articlesCount, setArticlesCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate active user count fluctuation
    const userTimer = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 10000);
    return () => clearInterval(userTimer);
  }, []);

  useEffect(() => {
    // Get articles count
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => setArticlesCount(data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-6 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400">LIVE</span>
          </div>
          <span className="text-gray-400">
            {time.toLocaleTimeString()} UTC
          </span>
          <span className="text-gray-400">
            {activeUsers} users online
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">CRYPTO • FINANCE • MARKETS</span>
          <span className="text-green-400">{articlesCount} STORIES</span>
        </div>
      </div>
    </div>
  );
}

// Main app component
function AppContent() {
  return (
    <div className="min-h-screen bg-black text-white">
      <StatusBar />
      
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white terminal-glow">COIN FEEDLY</h1>
            <p className="text-gray-400 text-sm">Real-time financial data • Stay informed, stay ahead</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 text-sm font-mono scanning-line">LIVE</div>
            <div className="text-gray-400 text-xs">Real-time news from trusted sources</div>
          </div>
        </div>
      </header>

      {/* Main feed */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <LiveFeed />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-6 py-4 mt-16">
        <div className="text-center text-gray-400 text-xs">
          <p>FINANCIAL NEWS AGGREGATOR • POWERED BY RSS FEEDS • REAL-TIME UPDATES</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}