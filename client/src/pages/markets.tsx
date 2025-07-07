import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { MarketData } from "@shared/schema";

export default function Markets() {
  const { data: marketData = [], isLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
  });

  const { data: topGainers = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data/gainers?limit=10'],
  });

  const { data: topLosers = [] } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data/losers?limit=10'],
  });

  const stockData = marketData.filter(item => item.type === 'stock');
  const cryptoData = marketData.filter(item => item.type === 'crypto');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Market Dashboard</h1>
        <p className="text-gray-600">Real-time market data and analysis</p>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.length}</div>
            <p className="text-xs text-muted-foreground">
              {stockData.length} stocks, {cryptoData.length} crypto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {topGainers[0] ? (
              <>
                <div className="text-2xl font-bold">{topGainers[0].symbol}</div>
                <p className="text-xs text-green-600">
                  +{formatPercent(Number(topGainers[0].changePercent))}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">--</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Loser</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {topLosers[0] ? (
              <>
                <div className="text-2xl font-bold">{topLosers[0].symbol}</div>
                <p className="text-xs text-red-600">
                  {formatPercent(Number(topLosers[0].changePercent))}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">--</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">
              Real-time data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Data Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="movers">Movers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-sm text-gray-500">{item.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatCurrency(Number(item.price))}
                        </div>
                        <div className={`text-sm ${
                          Number(item.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Number(item.changePercent) >= 0 ? '+' : ''}{formatPercent(Number(item.changePercent))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Cryptocurrencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cryptoData.slice(0, 10).map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                          <div className="text-sm text-gray-500">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatCurrency(Number(coin.price))}
                        </div>
                        <div className={`text-sm ${
                          Number(coin.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Number(coin.changePercent) >= 0 ? '+' : ''}{formatPercent(Number(coin.changePercent))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stocks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData.map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-semibold text-lg">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-semibold">
                        {formatCurrency(Number(stock.price))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          Number(stock.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Number(stock.changePercent) >= 0 ? '+' : ''}{formatCurrency(Number(stock.change))}
                        </span>
                        <Badge variant={Number(stock.changePercent) >= 0 ? 'default' : 'destructive'}>
                          {Number(stock.changePercent) >= 0 ? '+' : ''}{formatPercent(Number(stock.changePercent))}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cryptoData.map((crypto) => (
                  <div key={crypto.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-semibold text-lg">{crypto.symbol.toUpperCase()}</div>
                        <div className="text-sm text-gray-500">{crypto.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-semibold">
                        {formatCurrency(Number(crypto.price))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          Number(crypto.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Number(crypto.changePercent) >= 0 ? '+' : ''}{formatCurrency(Number(crypto.change))}
                        </span>
                        <Badge variant={Number(crypto.changePercent) >= 0 ? 'default' : 'destructive'}>
                          {Number(crypto.changePercent) >= 0 ? '+' : ''}{formatPercent(Number(crypto.changePercent))}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topGainers.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-sm text-gray-500">{item.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatCurrency(Number(item.price))}
                        </div>
                        <div className="text-sm text-green-600">
                          +{formatPercent(Number(item.changePercent))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLosers.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-sm text-gray-500">{item.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatCurrency(Number(item.price))}
                        </div>
                        <div className="text-sm text-red-600">
                          {formatPercent(Number(item.changePercent))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
