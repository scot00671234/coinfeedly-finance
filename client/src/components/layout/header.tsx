import { Link, useLocation } from "wouter";

const navigation = [
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
    <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-6">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-4xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer tracking-tight">
              Coin Feedly
            </h1>
          </Link>
          
          {/* Tagline */}
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Financial News & Market Analysis
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-8 py-4">
            <Link href="/">
              <span
                className={`text-sm font-medium transition-colors hover:text-gray-900 cursor-pointer ${
                  location === "/"
                    ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                    : "text-gray-600"
                }`}
              >
                Home
              </span>
            </Link>
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-gray-900 cursor-pointer ${
                    location === item.href
                      ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                      : "text-gray-600"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}