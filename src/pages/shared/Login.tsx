import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { UserTypeContext } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { setIsTranslator } = useContext(UserTypeContext);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { email, password } = formData;

      // 1. Autenticar com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Verificar papel do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, user_id')
        .eq('user_id', authData.user.id)
        .single();

      if (userError) throw userError;

      // 3. Verificação crítica para conta inativa - usa String.toLowerCase() para normalização
      const userRole = (userData.role || "").toString().toLowerCase().trim();
      
      console.log("--------- VERIFICAÇÃO DE SEGURANÇA ---------");
      console.log("ID do usuário:", userData.user_id);
      console.log("Papel do usuário (raw):", userData.role);
      console.log("Papel do usuário (normalizado):", userRole);
      
      // 4. Verificação principal para BLOQUEAR tradutores inativos
      if (userRole === "inactive_translator" || userRole.includes("inactive")) {
        console.log("⛔ BLOQUEANDO ACESSO: Usuário inativo detectado");
        
        // Forçar logout para garantir que não há token de autenticação válido
        await supabase.auth.signOut();
        
        // Redirecionar para página específica de conta inativa
        navigate("/conta-inativa", { replace: true });
        
        // Lançar erro para interromper a execução de qualquer código adicional
        throw new Error("Conta inativa");
      }
      
      console.log("✅ Verificação de segurança passou: usuário ativo");

      // 5. Processamento normal para usuários ativos
      const isTranslator = userRole === "translator";
      setIsTranslator(isTranslator);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${isTranslator ? "tradutor" : "cliente"}!`,
      });
      
      navigate(isTranslator ? "/translator" : "/");
    } catch (error: any) {
      // Não mostrar mensagem de erro para redirecionamentos de conta inativa
      if (error.message !== "Conta inativa") {
        console.error("Erro no login:", error);
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <Logo className="h-8 w-auto mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-xs text-gray-500">Faça login na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input 
              type="email" 
              placeholder="E-mail" 
              name="email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
          </div>
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="Senha" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
          </div>

          <Button type="submit" className="w-full bg-[#23B0DE] hover:bg-[#1E9BC7]" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Ainda não tem uma conta?{" "}
            <Link to="/cadastro" className="text-[#23B0DE] hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;