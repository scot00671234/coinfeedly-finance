import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Bitcoin, Coins } from "lucide-react";
import type { MarketData } from "@shared/schema";

interface MarketDataTablesProps {
  topGainers: MarketData[];
  cryptoData: MarketData[];
}

export default function MarketDataTables({ topGainers, cryptoData }: MarketDataTablesProps) {
  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'BTC' || symbol === 'ETH') {
      return `$${price.toLocaleString()}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const getCryptoIcon = (symbol: string) => {
    switch (symbol.toLowerCase()) {
      case 'btc':
        return <Bitcoin className="h-5 w-5 text-yellow-500" />;
      case 'eth':
        return <Coins className="h-5 w-5 text-blue-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Market Data</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Gainers */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topGainers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data available
                </div>
              ) : (
                topGainers.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-gray-900">{item.symbol}</div>
                        <div className="text-sm text-gray-500 truncate max-w-32">
                          {item.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900">
                        {formatPrice(Number(item.price), item.symbol)}
                      </div>
                      <Badge variant="default" className="text-xs">
                        {formatChange(Number(item.changePercent))}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Cryptocurrencies */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Bitcoin className="h-5 w-5 text-yellow-500 mr-2" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Top Cryptocurrencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cryptoData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data available
                </div>
              ) : (
                cryptoData.slice(0, 5).map((crypto) => (
                  <div key={crypto.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      {getCryptoIcon(crypto.symbol)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {crypto.symbol.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-32">
                          {crypto.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900">
                        {formatPrice(Number(crypto.price), crypto.symbol)}
                      </div>
                      <Badge 
                        variant={Number(crypto.changePercent) >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {formatChange(Number(crypto.changePercent))}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
