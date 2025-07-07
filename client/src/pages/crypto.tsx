import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface CryptoData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}

export default function Crypto() {
  const { data: cryptoData = [], isLoading } = useQuery({
    queryKey: ['/api/market-data/crypto'],
  });

  const { data: topGainers = [] } = useQuery({
    queryKey: ['/api/market-data/gainers'],
  });

  const cryptoGainers = topGainers.filter((item: CryptoData) => 
    ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'MATIC'].includes(item.symbol)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Cryptocurrency Markets</h1>
          <p className="text-lg text-neutral-600">Real-time cryptocurrency prices and market data</p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-neutral-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">$2.1T</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.4% 24h
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">$89.2B</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.7% 24h
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600">
                BTC Dominance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900">42.3%</div>
              <p className="text-sm text-neutral-500 mt-1">
                -0.2% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600">
                Fear & Greed Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">76</div>
              <p className="text-sm text-neutral-500 mt-1">
                Extreme Greed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Gainers */}
        {cryptoGainers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Top Crypto Gainers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cryptoGainers.slice(0, 6).map((crypto: CryptoData) => (
                <Card key={crypto.id} className="border-neutral-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{crypto.symbol}</h3>
                        <p className="text-sm text-neutral-600">{crypto.name}</p>
                      </div>
                      <Badge variant={crypto.changePercent > 0 ? "default" : "destructive"} className="bg-green-100 text-green-800">
                        {crypto.changePercent > 0 ? '+' : ''}{formatPercent(crypto.changePercent)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Price</span>
                        <span className="font-medium text-neutral-900">{formatCurrency(crypto.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">24h Change</span>
                        <span className={`font-medium ${crypto.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.change > 0 ? '+' : ''}{formatCurrency(crypto.change)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Cryptocurrencies */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">All Cryptocurrencies</h2>
          <Card className="border-neutral-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left p-4 font-medium text-neutral-600">#</th>
                      <th className="text-left p-4 font-medium text-neutral-600">Name</th>
                      <th className="text-right p-4 font-medium text-neutral-600">Price</th>
                      <th className="text-right p-4 font-medium text-neutral-600">24h %</th>
                      <th className="text-right p-4 font-medium text-neutral-600">Market Cap</th>
                      <th className="text-right p-4 font-medium text-neutral-600">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoData.map((crypto: CryptoData, index: number) => (
                      <tr key={crypto.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="p-4 text-neutral-900">{index + 1}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-neutral-900">{crypto.name}</div>
                            <div className="text-sm text-neutral-600">{crypto.symbol}</div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-neutral-900">
                          {formatCurrency(crypto.price)}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`flex items-center justify-end font-medium ${
                            crypto.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {crypto.changePercent > 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {crypto.changePercent > 0 ? '+' : ''}{formatPercent(crypto.changePercent)}
                          </span>
                        </td>
                        <td className="p-4 text-right text-neutral-900">
                          {crypto.marketCap ? formatCurrency(crypto.marketCap) : '-'}
                        </td>
                        <td className="p-4 text-right text-neutral-900">
                          {crypto.volume ? formatCurrency(crypto.volume) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}