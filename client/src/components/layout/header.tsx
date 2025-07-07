import { Link, useLocation } from "wouter";
import Ticker from "./ticker";

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/world", label: "World" },
    { path: "/us", label: "US" },
    { path: "/uk", label: "UK" },
    { path: "/companies", label: "Companies" },
    { path: "/tech", label: "Technology" },
    { path: "/markets", label: "Markets" },
    { path: "/crypto", label: "Crypto" },
  ];

  return (
    <>
      <Ticker />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-2xl font-bold text-blue-900">Coin Feedly</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors duration-200 px-3 py-2 ${
                    location === item.path
                      ? "text-blue-600 bg-blue-50 rounded"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Live indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">LIVE</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}