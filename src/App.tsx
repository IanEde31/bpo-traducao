import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout/Layout";
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "./lib/supabase";

// Páginas compartilhadas
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";
import Profile from "./pages/shared/Profile";
import Help from "./pages/shared/Help";
import InactiveAccount from "./pages/shared/InactiveAccount";

// Páginas do cliente
import ClientHome from "./pages/client/Home";
import NewQuote from "./pages/client/NewQuote";
import MyQuotes from "./pages/client/MyQuotes";
import MyOrders from "./pages/client/MyOrders";
import ClientOrders from "./pages/client/ClientOrders";

// Páginas do tradutor
import TranslatorHome from "./pages/translator/Home";
import AvailableOrders from "./pages/translator/AvailableOrders";
import MyTranslations from "./pages/translator/MyTranslations";
import TranslationHistory from "./pages/translator/TranslationHistory";
import TranslatorWorkspace from "./pages/translator/TranslatorWorkspace";

// Páginas do administrador
import TranslatorManagement from "./pages/admin/TranslatorManagement";
import AdminPromotionTool from "./pages/admin/AdminPromotionTool";
import { Dashboard } from "./pages/admin/Dashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { OrderManagement } from "./pages/admin/OrderManagement";

// Components
import RoleBasedRoute from "./components/routing/RoleBasedRoute";
import AdminRoute from "./components/routing/AdminRoute";

const queryClient = new QueryClient();

interface UserTypeContextType {
  isTranslator: boolean;
  setIsTranslator: (value: boolean) => void;
  isAuthenticated: boolean;
}

export const UserTypeContext = createContext<UserTypeContextType>({
  isTranslator: false,
  setIsTranslator: () => {},
  isAuthenticated: false,
});

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(UserTypeContext);
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  // Inicializar o estado a partir do localStorage para evitar perda após reload
  const [isTranslator, setIsTranslator] = useState(() => {
    const savedRole = localStorage.getItem('userRole');
    return savedRole === 'translator';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Função para atualizar o papel do usuário (persiste no localStorage)
  const updateUserRole = (role: string) => {
    const isUserTranslator = role === 'translator';
    setIsTranslator(isUserTranslator);
    localStorage.setItem('userRole', isUserTranslator ? 'translator' : 'client');
    console.log(`Papel do usuário atualizado: ${role}`);
  };

  useEffect(() => {
    // Verificar se há uma sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isUserAuthenticated = !!session;
      setIsAuthenticated(isUserAuthenticated);
      
      // Se o usuário estiver autenticado, verifica o papel
      if (session) {
        checkUserRole(session.user.id);
      } else {
        // Se não estiver autenticado, limpa o localStorage
        localStorage.removeItem('userRole');
      }
      
      setIsLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isUserAuthenticated = !!session;
      setIsAuthenticated(isUserAuthenticated);
      
      // Se o usuário fizer login, verifica seu papel
      if (event === 'SIGNED_IN' && session) {
        checkUserRole(session.user.id);
      }
      
      // Se o usuário deslogar, limpa o papel
      if (event === 'SIGNED_OUT') {
        updateUserRole('client');
        localStorage.removeItem('userRole');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para verificar o papel do usuário
  const checkUserRole = async (userId: string) => {
    try {
      console.log('Verificando o papel do usuário...');
      
      // Consulta direta na tabela users.role (estrutura correta do banco)
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao verificar o papel do usuário:', error.message);
        
        // MEDIDA DE EMERGÊNCIA: Verificar URL atual
        if (window.location.pathname.startsWith('/translator')) {
          console.log('Mantendo papel como tradutor baseado na URL atual');
          updateUserRole('translator');
        }
        return;
      }
      
      // Atualiza o estado com base no papel do usuário
      if (data?.role === 'translator') {
        updateUserRole('translator');
      } else {
        updateUserRole('client');
      }
    } catch (err) {
      console.error('Erro ao verificar o papel do usuário:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserTypeContext.Provider value={{ isTranslator, setIsTranslator, isAuthenticated }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login />
              } />
              <Route path="/cadastro" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Register />
              } />
              
              {/* Página de conta inativa */}
              <Route path="/conta-inativa" element={<InactiveAccount />} />

              {/* Rotas protegidas */}
              <Route
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute>
                      <Layout />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              >
                {/* Rotas do cliente */}
                <Route path="/" element={<ClientHome />} />
                <Route path="/novo-orcamento" element={<NewQuote />} />
                <Route path="/meus-orcamentos" element={<MyQuotes />} />
                <Route path="/meus-pedidos" element={<MyOrders />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/ajuda" element={<Help />} />
                <Route path="/configuracoes" element={<Profile />} />

                {/* Rotas do tradutor */}
                <Route path="/translator" element={<TranslatorHome />} />
                <Route path="/translator/pedidos-disponiveis" element={<AvailableOrders />} />
                <Route path="/translator/minhas-traducoes" element={<MyTranslations />} />
                <Route path="/translator/workspace/:requestId" element={<TranslatorWorkspace />} />
                <Route path="/translator/historico" element={<TranslationHistory />} />
                <Route path="/translator/perfil" element={<Profile />} />
                <Route path="/translator/ajuda" element={<Help />} />
                <Route path="/translator/configuracoes" element={<Profile />} />
              </Route>

              {/* Rota de administrador */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Layout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
              </Route>
              
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Layout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<UserManagement />} />
              </Route>
              
              <Route
                path="/admin/pedidos"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Layout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<OrderManagement />} />
              </Route>
              
              <Route
                path="/admin/tradutores"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Layout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<TranslatorManagement />} />
              </Route>
              <Route
                path="/admin/ferramentas"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Layout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminPromotionTool />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserTypeContext.Provider>
    </QueryClientProvider>
  );
};

export default App;