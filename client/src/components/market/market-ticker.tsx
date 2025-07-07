import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { MarketData } from "@shared/schema";

export default function MarketTicker() {
  const [tickerData, setTickerData] = useState<MarketData[]>([]);
  
  const { data: marketData = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (marketData.length > 0) {
      // Select key market indicators for the ticker
      const keySymbols = ['SPY', 'QQQ', 'BTC', 'ETH', 'AAPL', 'TSLA', 'NVDA'];
      const filtered = marketData.filter(item => 
        keySymbols.includes(item.symbol.toUpperCase())
      );
      setTickerData(filtered);
    }
  }, [marketData]);

  if (tickerData.length === 0) {
    return (
      <div className="bg-gray-900 text-white py-2 overflow-hidden">
        <div className="animate-pulse">
          <div className="flex space-x-8 text-sm font-mono">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-4 bg-gray-700 rounded w-8"></div>
                <div className="h-4 bg-gray-700 rounded w-12"></div>
                <div className="h-4 bg-gray-700 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden">
      <div className="animate-marquee">
        <div className="flex space-x-8 text-sm font-mono whitespace-nowrap">
          {/* Duplicate the ticker items for continuous scroll */}
          {[...tickerData, ...tickerData].map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center space-x-2">
              <span className="text-gray-300">{item.symbol}</span>
              <span className={`${
                Number(item.changePercent) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${Number(item.price).toFixed(2)}
              </span>
              <span className={`${
                Number(item.changePercent) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {Number(item.changePercent) >= 0 ? '+' : ''}{Number(item.changePercent).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
