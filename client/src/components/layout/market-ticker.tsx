import { useQuery } from "@tanstack/react-query";
import { formatPercent } from "@/lib/utils";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketTicker() {
  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data/gainers"],
    refetchInterval: 30000, // Update every 30 seconds
  });

  if (!marketData || marketData.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden">
      <div className="flex animate-scroll">
        <div className="flex space-x-8 whitespace-nowrap">
          {marketData.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2 px-4">
              <span className="font-semibold text-sm">{stock.symbol}</span>
              <span className="text-sm">${stock.price.toFixed(2)}</span>
              <span className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless scrolling */}
          {marketData.map((stock, index) => (
            <div key={`${stock.symbol}-duplicate-${index}`} className="flex items-center space-x-2 px-4">
              <span className="font-semibold text-sm">{stock.symbol}</span>
              <span className="text-sm">${stock.price.toFixed(2)}</span>
              <span className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}