import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <img src="/lovable-uploads/84531977-88a3-4c95-8ec9-d55c5c49b595.png" alt="BPO Logo" className="h-8 mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
          <p className="text-gray-500 text-sm">Preencha os dados para se cadastrar</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Input type="text" placeholder="Nome completo" />
          </div>
          <div className="space-y-2">
            <Input type="email" placeholder="E-mail" />
          </div>
          <div className="space-y-2">
            <Input type="password" placeholder="Senha" />
          </div>
          <div className="space-y-2">
            <Input type="password" placeholder="Confirmar senha" />
          </div>
          <Button className="w-full bg-[#23B0DE] hover:bg-[#1E9BC7]">
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Já possui uma conta?{" "}
            <Link to="/login" className="text-[#23B0DE] hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;