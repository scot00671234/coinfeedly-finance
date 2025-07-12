import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

// Real-time feed item component with user retention features
function FeedItem({ item, onExpand }: { item: any; onExpand: (item: any) => void }) {
  const [isNew, setIsNew] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }, [item.id]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand(item);
  };

  return (
    <div className={cn(
      "border-l-2 border-gray-800 pl-4 py-3 transition-all duration-300 cursor-pointer hover:bg-gray-900/50",
      isNew && "border-l-green-400 bg-green-900/10",
      isExpanded && "border-l-green-400 bg-gray-900/30"
    )} onClick={handleExpand}>
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
          <p className="text-gray-300 text-sm leading-relaxed">
            {isExpanded ? item.content : item.summary}
          </p>
          {isExpanded && (
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <button className="hover:text-green-400 transition-colors">
                💬 Discuss
              </button>
              <button className="hover:text-green-400 transition-colors">
                🔗 Share
              </button>
              <button className="hover:text-green-400 transition-colors">
                📊 Analysis
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isNew && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
          <div className="text-gray-400 text-xs">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main feed component with user retention features
function LiveFeed() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
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

  const handleArticleExpand = (article: any) => {
    setSelectedArticle(article);
    // Track article views
    fetch(`/api/articles/${article.id}/view`, { method: 'POST' }).catch(() => {});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-400 text-sm animate-pulse">
          <div className="scanning-line">Loading financial intelligence...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-green-400 mb-2">🔄 SYSTEM INITIALIZING</div>
          <div className="text-sm">Financial intelligence streams coming online...</div>
        </div>
      ) : (
        articles.map((item: any) => (
          <FeedItem 
            key={item.id} 
            item={item} 
            onExpand={handleArticleExpand}
          />
        ))
      )}
    </div>
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
            <p className="text-gray-400 text-sm">Real-time financial intelligence • Stay informed, stay ahead</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 text-sm font-mono scanning-line">SYSTEM ACTIVE</div>
            <div className="text-gray-400 text-xs">All content curated for maximum retention</div>
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
          <p>CLASSIFIED FINANCIAL INTELLIGENCE • REAL-TIME MARKET ANALYSIS</p>
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