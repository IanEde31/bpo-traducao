import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserTypeContext } from "@/App";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { setIsTranslator } = useContext(UserTypeContext);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userType = formData.get("userType") as string;
    
    setIsTranslator(userType === "translator");
    
    toast({
      title: "Login realizado com sucesso",
      description: `Bem-vindo, ${userType === "translator" ? "tradutor" : "cliente"}!`,
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <img src="/lovable-uploads/84531977-88a3-4c95-8ec9-d55c5c49b595.png" alt="BPO Logo" className="h-8 mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-500 text-sm">Faça login na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input type="email" placeholder="E-mail" name="email" required />
          </div>
          <div className="space-y-2">
            <Input type="password" placeholder="Senha" name="password" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de usuário</label>
            <RadioGroup defaultValue="client" name="userType" className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <label htmlFor="client" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cliente
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="translator" id="translator" />
                <label htmlFor="translator" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tradutor
                </label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full bg-[#23B0DE] hover:bg-[#1E9BC7]">
            <LogIn className="mr-2 h-4 w-4" />
            Entrar
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