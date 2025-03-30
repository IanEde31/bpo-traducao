import { Home, FileText, FileCheck, User, HelpCircle, X, Users, Settings, LayoutDashboard, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const clientMenuItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: FileText, label: "Novo Orçamento", path: "/novo-orcamento" },
  { icon: FileText, label: "Meus Orçamentos", path: "/meus-orcamentos" },
  { icon: FileCheck, label: "Meus Pedidos", path: "/meus-pedidos" },
  { icon: User, label: "Perfil", path: "/perfil" },
  { icon: HelpCircle, label: "Ajuda", path: "/ajuda" },
];

const translatorMenuItems = [
  { icon: Home, label: "Início", path: "/translator" },
  { icon: FileText, label: "Pedidos Disponíveis", path: "/translator/pedidos-disponiveis" },
  { icon: FileCheck, label: "Minhas Traduções", path: "/translator/minhas-traducoes" },
  { icon: FileCheck, label: "Histórico", path: "/translator/historico" },
  { icon: User, label: "Perfil", path: "/translator/perfil" },
  { icon: HelpCircle, label: "Ajuda", path: "/translator/ajuda" },
];

const adminMenuItems = [
  // Itens temporariamente desativados para atualização de desenvolvimento
  // { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  // { icon: Users, label: "Gestão de Usuários", path: "/admin/usuarios" },
  // { icon: ShoppingCart, label: "Gestão de Pedidos", path: "/admin/pedidos" },
  { icon: Users, label: "Gerenciar Tradutores", path: "/admin/tradutores" },
  // { icon: Settings, label: "Ferramentas Admin", path: "/admin/ferramentas" },
];

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const location = useLocation();
  const { toast } = useToast();

  // Verificar qual tipo de rota está sendo acessada
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTranslatorRoute = location.pathname.startsWith('/translator');

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Selecionar os itens de menu apropriados com base na rota atual
  let menuItems = clientMenuItems;  // Padrão: menu de cliente
  
  if (isAdminRoute) {
    menuItems = adminMenuItems;
  } else if (isTranslatorRoute) {
    menuItems = translatorMenuItems;
  }

  return (
    <div className={`w-64 bg-white ${isMobile ? 'h-full' : 'min-h-screen'} p-4 shadow-lg`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Logo className="h-8 w-auto" />
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-4">
          {isAdminRoute ? (
            <div>
              <h2 className="text-sm font-medium text-red-600">Modo Administrador</h2>
              <p className="text-xs text-gray-500">Gerenciamento do sistema</p>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-medium text-[#23B0DE]">
                Olá, {isTranslatorRoute ? "tradutor" : "cliente"}!
              </h2>
              <p className="text-xs text-gray-500">Bem-vindo à sua conta!</p>
            </div>
          )}
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? isAdminRoute 
                    ? "bg-red-50 text-red-600" 
                    : "bg-[#F0F7FF] text-[#23B0DE]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${
                isActive 
                  ? isAdminRoute 
                    ? "text-red-600" 
                    : "text-[#23B0DE]" 
                  : "text-gray-400"
              }`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}