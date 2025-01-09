import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout/Layout";

// Pages
import Home from "./pages/Index";
import NewQuote from "./pages/NewQuote";
import MyQuotes from "./pages/MyQuotes";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/novo-orcamento" element={<NewQuote />} />
            <Route path="/meus-orcamentos" element={<MyQuotes />} />
            <Route path="/meus-pedidos" element={<MyOrders />} />
            <Route path="/cadastro" element={<Profile />} />
            <Route path="/ajuda" element={<Help />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;