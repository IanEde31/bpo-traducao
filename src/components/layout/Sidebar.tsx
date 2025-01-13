import { Home, FilePlus, FileText, FileCheck, User, HelpCircle, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const clientMenuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FilePlus, label: "Novo orçamento", path: "/novo-orcamento" },
  { icon: FileText, label: "Meus orçamentos", path: "/meus-orcamentos" },
  { icon: FileCheck, label: "Meus pedidos", path: "/meus-pedidos" },
  { icon: User, label: "Cadastro", path: "/cadastro" },
  { icon: HelpCircle, label: "Ajuda", path: "/ajuda" },
];

const translatorMenuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Mensagens", path: "/mensagens" },
  { icon: FileText, label: "Orçamentos", path: "/orcamentos" },
  { icon: FileCheck, label: "Pedidos", path: "/pedidos" },
  { icon: User, label: "Perfil", path: "/perfil" },
  { icon: HelpCircle, label: "Ajuda", path: "/ajuda" },
];

export function Sidebar() {
  const location = useLocation();
  const { toast } = useToast();
  const [isTranslator, setIsTranslator] = useState(false);

  const handleModeChange = (checked: boolean) => {
    setIsTranslator(checked);
    toast({
      title: `Modo ${checked ? "Tradutor" : "Cliente"} ativado`,
      description: "A interface foi atualizada",
    });
  };

  const menuItems = isTranslator ? translatorMenuItems : clientMenuItems;

  return (
    <div className="w-64 bg-white min-h-screen p-4 shadow-lg">
      <div className="mb-8">
        <img src="/lovable-uploads/84531977-88a3-4c95-8ec9-d55c5c49b595.png" alt="BPO Logo" className="h-8" />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#23B0DE]">
              Olá, {isTranslator ? "tradutor" : "cliente"}!
            </h2>
            <p className="text-xs text-gray-500">Bem-vindo à sua conta!</p>
          </div>
          <Switch
            checked={isTranslator}
            onCheckedChange={handleModeChange}
            className="ml-2"
          />
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
                  ? "bg-[#E2F3FE] text-[#23B0DE] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-[#23B0DE]" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}