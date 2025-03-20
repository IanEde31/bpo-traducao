import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserTypeContext } from "@/App";

const RoleBasedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isTranslator } = useContext(UserTypeContext);
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Verificação dupla: localStorage + contexto
    // Isso garante uma navegação consistente mesmo com falhas no banco de dados
    const savedRole = localStorage.getItem('userRole');
    const isTranslatorFromStorage = savedRole === 'translator';
    
    // Se o valor do localStorage conflitar com o contexto em rotas específicas, priorizamos o localStorage
    // que é mais estável entre recarregamentos de página
    let finalRole = isTranslator;
    
    if (location.pathname.startsWith('/translator') && !isTranslator && isTranslatorFromStorage) {
      console.log("Correção de papel: Usuário é tradutor baseado no localStorage, corrigindo...");
      finalRole = true;
    } else if (!location.pathname.startsWith('/translator') && isTranslator && !isTranslatorFromStorage) {
      console.log("Correção de papel: Usuário é cliente baseado no localStorage, corrigindo...");
      finalRole = false;
    }
    
    setEffectiveRole(finalRole);
    
    // Garantimos que há tempo suficiente para que o papel seja definido
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log(`RoleBasedRoute ativado: usuário é tradutor? ${finalRole}`, { 
        pathname: location.pathname,
        contextRole: isTranslator ? 'translator' : 'client',
        storageRole: savedRole || 'não definido',
        finalRole: finalRole ? 'translator' : 'client'
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isTranslator, location.pathname]);
  
  // Aguardar até que o papel efetivo seja determinado
  if (!isReady || effectiveRole === null) {
    return <>{children}</>;
  }

  // Usar o papel efetivo (combinação de contexto e localStorage) para navegação
  if (effectiveRole && !location.pathname.startsWith('/translator')) {
    console.log('Redirecionando para área do tradutor...');
    return <Navigate to="/translator" replace />;
  }

  if (!effectiveRole && location.pathname.startsWith('/translator')) {
    console.log('Redirecionando para área do cliente...');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
