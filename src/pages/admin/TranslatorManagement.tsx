import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Translator {
  translator_id: string;
  user_id: string;
  name: string;
  email: string;
  languages: string[];
  is_active: boolean;
  rating?: number;
  certifications?: string;
  created_at: string;
}

export default function TranslatorManagement() {
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTranslators();
  }, []);

  async function fetchTranslators() {
    try {
      setIsLoading(true);
      
      // Definir a interface para os dados retornados pelo Supabase
      interface TranslatorData {
        translator_id: string;
        user_id: string;
        languages: string[] | string | null;
        certifications: string | null;
        rating: number | null;
        users: {
          name: string;
          email: string;
          role: string;
          created_at: string;
        };
      }
      
      // Buscar usuários com a função 'tradutor' unindo as tabelas users e translators
      const { data, error } = await supabase
        .from('translators')
        .select(`
          translator_id,
          user_id,
          languages,
          certifications,
          rating,
          users (
            name,
            email,
            role,
            created_at
          )
        `)
        .order('created_at', { foreignTable: 'users', ascending: false });
      
      if (error) throw error;
      
      // Transformar os dados para o formato que precisamos
      if (data) {
        const formattedTranslators = (data as TranslatorData[]).map(item => ({
          translator_id: item.translator_id,
          user_id: item.user_id,
          name: item.users.name,
          email: item.users.email,
          languages: typeof item.languages === 'string' ? [item.languages] : item.languages || [],
          is_active: item.users.role === 'translator',
          rating: item.rating,
          certifications: item.certifications,
          created_at: item.users.created_at
        }));
        
        setTranslators(formattedTranslators);
      }
    } catch (error) {
      console.error('Erro ao buscar tradutores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de tradutores",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleTranslatorStatus(translator: Translator) {
    try {
      setProcessingIds(prev => [...prev, translator.translator_id]);
      
      // Usando os valores conforme a restrição da tabela
      const newRole = translator.is_active ? 'inactive_translator' : 'translator';
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('user_id', translator.user_id);
      
      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }
      
      // Atualizar estado local
      setTranslators(translators.map(t => 
        t.translator_id === translator.translator_id 
          ? { ...t, is_active: !translator.is_active } 
          : t
      ));
      
      toast({
        title: "Sucesso", 
        description: `Tradutor ${translator.is_active ? 'desativado' : 'ativado'} com sucesso`
      });
    } catch (error: any) {
      console.error('Erro ao alterar status do tradutor:', error);
      toast({
        title: "Erro", 
        description: `Não foi possível ${translator.is_active ? 'desativar' : 'ativar'} o tradutor: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== translator.translator_id));
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
        heading="Gerenciamento de Tradutores"
        text="Gerencie os tradutores da plataforma"
      />
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Lista de Tradutores</h2>
          <div className="text-sm text-gray-500">
            {translators.length} tradutores encontrados
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {translators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum tradutor encontrado
              </div>
            ) : (
              translators.map((translator) => (
                <div 
                  key={translator.translator_id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(translator.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">{translator.name}</div>
                      <div className="text-sm text-gray-500">{translator.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {translator.languages?.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <span className="text-sm text-gray-500 mr-2">
                        {translator.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      
                      {processingIds.includes(translator.translator_id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Switch
                          checked={translator.is_active}
                          onCheckedChange={() => toggleTranslatorStatus(translator)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
