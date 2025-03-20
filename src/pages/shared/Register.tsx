import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { Textarea } from "@/components/ui/textarea";
import InputMask from "react-input-mask";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isIndividual, setIsIndividual] = useState(true);
  const [userType, setUserType] = useState<"client" | "translator">("client");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      const name = formData.get("name") as string;
      const birthDate = formData.get("birthDate") as string;
      const document = formData.get("document") as string;
      const phone = formData.get("phone") as string;
      const newsletter = formData.get("newsletter") === "on";
      const languages = formData.get("languages") as string;
      const certifications = formData.get("certifications") as string;

      // Validações
      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem");
      }

      if (password.length < 6 || password.length > 20) {
        throw new Error("A senha deve ter entre 6 e 20 caracteres");
      }

      // Validar CPF/CNPJ
      const cleanDocument = document.replace(/[^\d]/g, "");
      if (isIndividual && cleanDocument.length !== 11) {
        throw new Error("CPF inválido");
      }
      if (!isIndividual && cleanDocument.length !== 14) {
        throw new Error("CNPJ inválido");
      }

      // Registrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Criar registro na tabela users
      const { error: userError } = await supabase
        .from("users")
        .insert([
          {
            user_id: authData.user?.id,
            name,
            birth_date: birthDate,
            role: userType,
            is_individual: isIndividual,
            cpf: isIndividual ? cleanDocument : null,
            cnpj: !isIndividual ? cleanDocument : null,
            phone,
            email,
            newsletter,
          },
        ]);

      if (userError) throw userError;

      // Se for tradutor, criar registro na tabela translators
      if (userType === "translator") {
        const { error: translatorError } = await supabase
          .from("translators")
          .insert([
            {
              user_id: authData.user?.id,
              languages,
              certifications,
              rating: 0, // Iniciar com rating 0
            },
          ]);

        if (translatorError) throw translatorError;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <Logo className="h-8 w-auto mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
          <p className="text-gray-500 text-sm">Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de usuário</label>
            <RadioGroup
              value={userType}
              onValueChange={(value: "client" | "translator") => setUserType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <label htmlFor="client" className="text-sm font-medium leading-none">
                  Cliente
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="translator" id="translator" />
                <label htmlFor="translator" className="text-sm font-medium leading-none">
                  Tradutor
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Input type="text" placeholder="Nome completo" name="name" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data de nascimento</label>
            <Input type="date" name="birthDate" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de pessoa</label>
            <RadioGroup
              value={isIndividual ? "PF" : "PJ"}
              onValueChange={(value) => setIsIndividual(value === "PF")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PF" id="pf" />
                <label htmlFor="pf" className="text-sm font-medium leading-none">
                  Pessoa Física
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PJ" id="pj" />
                <label htmlFor="pj" className="text-sm font-medium leading-none">
                  Pessoa Jurídica
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <InputMask
              mask={isIndividual ? "999.999.999-99" : "99.999.999/9999-99"}
              maskChar={null}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={isIndividual ? "CPF" : "CNPJ"}
              name="document"
              required
            />
          </div>

          <div className="space-y-2">
            <InputMask
              mask="(99) 99999-9999"
              maskChar={null}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Telefone"
              name="phone"
              required
            />
          </div>

          {userType === "translator" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Idiomas</label>
                <Input
                  type="text"
                  placeholder="Ex: Inglês, Espanhol, Francês"
                  name="languages"
                  required
                />
                <p className="text-xs text-gray-500">Separe os idiomas por vírgula</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Certificações</label>
                <Textarea
                  placeholder="Liste suas certificações e qualificações"
                  name="certifications"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Input type="email" placeholder="E-mail" name="email" required />
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha"
              name="password"
              minLength={6}
              maxLength={20}
              required
            />
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Confirmar senha"
              name="confirmPassword"
              minLength={6}
              maxLength={20}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="newsletter" name="newsletter" />
            <label
              htmlFor="newsletter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Receber newsletter da BPO
            </label>
          </div>

          <Button type="submit" className="w-full bg-[#23B0DE] hover:bg-[#1E9BC7]" disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? "Cadastrando..." : "Cadastrar"}
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