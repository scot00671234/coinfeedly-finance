import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketData } from "@shared/schema";

export default function Ticker() {
  const { data: marketData = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data/gainers?limit=10'],
    refetchInterval: 10000, // Update every 10 seconds
  });

  if (marketData.length === 0) return null;

  return (
    <div className="bg-blue-900 text-white py-2 overflow-hidden">
      <div className="flex animate-scroll">
        {/* Duplicate the data to create seamless loop */}
        {[...marketData, ...marketData].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex items-center space-x-2 mx-8 whitespace-nowrap">
            <span className="font-semibold text-sm">{item.symbol}</span>
            <span className="text-sm">${Number(item.price).toFixed(2)}</span>
            <div className={`flex items-center text-xs ${
              Number(item.change) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {Number(item.change) >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              <span>{Number(item.changePercent).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}