import { Home, FileText, FileCheck, User, HelpCircle, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Plus, label: "Novo orçamento", path: "/novo-orcamento" },
  { icon: FileText, label: "Meus orçamentos", path: "/meus-orcamentos" },
  { icon: FileCheck, label: "Meus pedidos", path: "/meus-pedidos" },
  { icon: User, label: "Cadastro", path: "/cadastro" },
  { icon: HelpCircle, label: "Ajuda", path: "/ajuda" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <img src="/lovable-uploads/3ea239ae-8609-4d4c-85d5-8e2fb8198968.png" alt="BPO Logo" className="h-8" />
        <div className="mt-4">
          <h2 className="text-sm font-medium">Olá, cliente!</h2>
          <p className="text-xs text-gray-500">Bem-vindo à sua conta!</p>
        </div>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                isActive
                  ? "bg-secondary text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}