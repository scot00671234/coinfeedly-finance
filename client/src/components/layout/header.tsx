import { Link, useLocation } from "wouter";
import MarketTicker from "./market-ticker";

const navigation = [
  { name: "Home", href: "/" },
  { name: "World", href: "/world" },
  { name: "US", href: "/us" },
  { name: "UK", href: "/uk" },
  { name: "Companies", href: "/companies" },
  { name: "Technology", href: "/tech" },
  { name: "Markets", href: "/markets" },
  { name: "Crypto", href: "/crypto" },
];

export default function Header() {
  const [location] = useLocation();

  return (
    <>
      <MarketTicker />
      <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Coin Feedly
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-blue-600 cursor-pointer ${
                    location === item.href
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}