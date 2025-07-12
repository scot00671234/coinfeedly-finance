import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const queryClient = new QueryClient();

// Real-time feed item component
function FeedItem({ item }: { item: any }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }, [item.id]);

  return (
    <div className={cn(
      "border-l-2 border-gray-800 pl-4 py-3 transition-all duration-300",
      isNew && "border-l-green-400 bg-green-900/10"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span className="px-2 py-1 bg-gray-800 rounded text-green-400">
              {item.category || 'NEWS'}
            </span>
            <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
          </div>
          <h3 className="text-white font-medium mb-2 leading-tight">
            {item.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {item.summary}
          </p>
        </div>
        {isNew && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-4 mt-2" />
        )}
      </div>
    </div>
  );
}

// Main feed component
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

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://${window.location.host}`);
    
    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => setConnectionStatus('disconnected');
    ws.onerror = () => setConnectionStatus('disconnected');

    return () => ws.close();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-400 text-sm">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {articles.map((item: any) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}

// Status bar component
function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">CRYPTO • FINANCE • MARKETS</span>
          <span className="text-green-400">REAL-TIME FEED</span>
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
            <h1 className="text-2xl font-bold text-white">FINANCIAL INTEL</h1>
            <p className="text-gray-400 text-sm">Real-time market intelligence feed</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 text-sm font-mono">SYSTEM ACTIVE</div>
            <div className="text-gray-400 text-xs">Neural network processing</div>
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