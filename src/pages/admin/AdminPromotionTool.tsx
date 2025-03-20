import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPromotionTool() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  async function handleSearch() {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email para buscar",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setFoundUser(null);

      // Buscar usuário pelo email
      const { data: users, error } = await supabase
        .from('users')
        .select('user_id, email, name, role')
        .ilike('email', email.trim())
        .limit(1);

      if (error) throw error;

      if (users && users.length > 0) {
        setFoundUser(users[0]);
      } else {
        toast({
          title: "Usuário não encontrado",
          description: "Nenhum usuário encontrado com este email",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o usuário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function promoteToAdmin() {
    if (!foundUser) return;

    try {
      setIsPromoting(true);

      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('user_id', foundUser.user_id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${foundUser.name} agora é um administrador`,
      });

      // Atualizar usuário encontrado
      setFoundUser({
        ...foundUser,
        role: 'admin'
      });
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário a administrador",
        variant: "destructive"
      });
    } finally {
      setIsPromoting(false);
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <PageHeader
        heading="Ferramentas de Administrador"
        text="Gerencie usuários administrativos do sistema"
      />

      <Card className="p-6">
        <h2 className="text-xl font-medium mb-6">Promoção de Administradores</h2>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Email do usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !email.trim()} 
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Buscar
            </Button>
          </div>

          {foundUser && (
            <div className="border rounded-lg p-4 mt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(foundUser.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium text-lg">{foundUser.name}</div>
                  <div className="text-sm text-gray-500">{foundUser.email}</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {foundUser.role === 'admin' ? 'Administrador' : foundUser.role}
                    </span>
                  </div>
                </div>

                {foundUser.role !== 'admin' ? (
                  <Button
                    onClick={promoteToAdmin}
                    disabled={isPromoting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isPromoting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Promover
                  </Button>
                ) : (
                  <div className="flex items-center text-sm text-green-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Já é administrador
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
