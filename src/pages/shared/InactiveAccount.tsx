import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Página de conta inativa que força o logout e impede acesso ao sistema
 */
export default function InactiveAccount() {
  // Força logout do usuário para garantir que ele não possa acessar o sistema
  useEffect(() => {
    const forceLogout = async () => {
      await supabase.auth.signOut();
    };
    
    forceLogout();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo className="h-10 w-auto" />
          
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Conta Inativa</h1>
          
          <p className="text-gray-600">
            Sua conta de tradutor está atualmente <span className="font-bold text-red-600">inativa</span>.
            Você não pode acessar o sistema até que sua conta seja reativada por um administrador.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg w-full">
            <p className="text-amber-800 text-sm">
              Se você acredita que isso é um erro ou deseja solicitar a reativação 
              da sua conta, entre em contato com o suporte através do email:
            </p>
            <p className="text-amber-900 font-medium mt-2">
              suporte@bpo-traducao.com
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Link to="/login">
            <Button className="w-full bg-[#23B0DE] hover:bg-[#1E9BC7]">
              Voltar para Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
