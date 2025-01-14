import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout/Layout";
import { createContext, useState } from "react";

// Pages
import Home from "./pages/Index";
import NewQuote from "./pages/NewQuote";
import MyQuotes from "./pages/MyQuotes";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

interface UserTypeContextType {
  isTranslator: boolean;
  setIsTranslator: (value: boolean) => void;
}

export const UserTypeContext = createContext<UserTypeContextType>({
  isTranslator: false,
  setIsTranslator: () => {},
});

const App = () => {
  const [isTranslator, setIsTranslator] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <UserTypeContext.Provider value={{ isTranslator, setIsTranslator }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/novo-orcamento" element={<NewQuote />} />
                <Route path="/meus-orcamentos" element={<MyQuotes />} />
                <Route path="/meus-pedidos" element={<MyOrders />} />
                <Route path="/minhas-traducoes" element={<MyOrders />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/ajuda" element={<Help />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserTypeContext.Provider>
    </QueryClientProvider>
  );
};

export default App;