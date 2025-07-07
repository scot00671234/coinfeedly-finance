import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Articles from "@/pages/articles";
import Markets from "@/pages/markets";
import CryptoPage from "@/pages/crypto";
import Analysis from "@/pages/analysis";
import World from "@/pages/world";
import US from "@/pages/us";
import UK from "@/pages/uk";
import Companies from "@/pages/companies";
import Tech from "@/pages/tech";
import NotFound from "@/pages/not-found";
import ArticlePage from "@/pages/article";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/world" component={World} />
      <Route path="/us" component={US} />
      <Route path="/uk" component={UK} />
      <Route path="/companies" component={Companies} />
      <Route path="/tech" component={Tech} />
      <Route path="/articles" component={Articles} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/markets" component={Markets} />
      <Route path="/crypto" component={CryptoPage} />
      <Route path="/analysis" component={Analysis} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-neutral-50">
          <Header />
          <main>
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
