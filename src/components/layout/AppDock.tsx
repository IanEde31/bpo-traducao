import { useContext } from 'react';
import { UserTypeContext } from '@/App';
import { Home, FileText, FileCheck, User, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

const clientMenuItems = [
  {
    title: "Home",
    icon: <Home className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/"
  },
  {
    title: "Novo orçamento",
    icon: <FileText className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/novo-orcamento"
  },
  {
    title: "Meus orçamentos",
    icon: <FileText className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/meus-orcamentos"
  },
  {
    title: "Meus pedidos",
    icon: <FileCheck className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/meus-pedidos"
  },
  {
    title: "Cadastro",
    icon: <User className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/cadastro"
  },
  {
    title: "Ajuda",
    icon: <HelpCircle className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/ajuda"
  }
];

const translatorMenuItems = [
  {
    title: "Home",
    icon: <Home className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/"
  },
  {
    title: "Meus orçamentos",
    icon: <FileText className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/meus-orcamentos"
  },
  {
    title: "Minhas traduções",
    icon: <FileCheck className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/minhas-traducoes"
  },
  {
    title: "Cadastro",
    icon: <User className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/cadastro"
  },
  {
    title: "Ajuda",
    icon: <HelpCircle className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
    path: "/ajuda"
  }
];

export function AppDock() {
  const { isTranslator } = useContext(UserTypeContext);
  const menuItems = isTranslator ? translatorMenuItems : clientMenuItems;

  return (
    <div className="fixed bottom-2 left-1/2 max-w-full -translate-x-1/2 z-50">
      <Dock className="items-end pb-3">
        {menuItems.map((item, idx) => (
          <Link to={item.path} key={idx}>
            <DockItem className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800">
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          </Link>
        ))}
      </Dock>
    </div>
  );
}