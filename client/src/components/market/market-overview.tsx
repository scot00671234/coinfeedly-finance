import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, Bitcoin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketData } from "@shared/schema";

interface MarketOverviewProps {
  marketData: MarketData[];
  isLoading: boolean;
}

export default function MarketOverview({ marketData, isLoading }: MarketOverviewProps) {
  if (isLoading) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Find specific market data
  const spy = marketData.find(item => item.symbol === 'SPY');
  const btc = marketData.find(item => item.symbol === 'BTC');
  const eth = marketData.find(item => item.symbol === 'ETH');
  const qqq = marketData.find(item => item.symbol === 'QQQ');

  const marketCards = [
    {
      title: "S&P 500",
      symbol: "SPY",
      data: spy,
      icon: TrendingUp,
      iconColor: "text-green-500",
    },
    {
      title: "Bitcoin",
      symbol: "BTC",
      data: btc,
      icon: Bitcoin,
      iconColor: "text-yellow-500",
    },
    {
      title: "Ethereum",
      symbol: "ETH",
      data: eth,
      icon: TrendingUp,
      iconColor: "text-blue-500",
    },
    {
      title: "NASDAQ",
      symbol: "QQQ",
      data: qqq,
      icon: BarChart3,
      iconColor: "text-primary",
    },
  ];

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketCards.map((card) => {
          const Icon = card.icon;
          const price = card.data ? Number(card.data.price) : 0;
          const change = card.data ? Number(card.data.change) : 0;
          const changePercent = card.data ? Number(card.data.changePercent) : 0;
          const isPositive = changePercent >= 0;

          return (
            <Card key={card.symbol} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {card.data ? (
                    card.symbol === 'BTC' || card.symbol === 'ETH' ? 
                      `$${price.toLocaleString()}` : 
                      price.toFixed(2)
                  ) : (
                    '--'
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.data ? (
                      <>
                        {isPositive ? '+' : ''}{change.toFixed(2)}
                      </>
                    ) : (
                      '--'
                    )}
                  </span>
                  <span className={`text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.data ? (
                      <>
                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                      </>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
