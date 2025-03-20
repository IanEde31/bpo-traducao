import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TranslatorOrderCard } from "@/components/orders/TranslatorOrderCard";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TranslationRequest {
  request_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  word_count: number;
  service_type: string;
  source_language: string;
  target_language: string;
  delivery_date: string;
  created_at: string;
  status: string;
  total_price: number;
  price_per_word: number;
  currency: string;
}

const MyTranslations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [translations, setTranslations] = useState<TranslationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      
      // Obter o ID do tradutor logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Obter o translator_id do usuário logado
      const { data: translatorData, error: translatorError } = await supabase
        .from('translators')
        .select('translator_id')
        .eq('user_id', user.id)
        .single();

      if (translatorError || !translatorData) {
        throw new Error('Tradutor não encontrado');
      }

      // Buscar as traduções do tradutor
      const { data, error } = await supabase
        .from('translationrequests')
        .select('*')
        .eq('translator_id', translatorData.translator_id)
        .in('status', ['in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTranslations(data || []);
    } catch (error) {
      console.error('Erro ao buscar traduções:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar traduções",
        description: "Não foi possível carregar suas traduções. Por favor, tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList, orderId: string) => {
    try {
      // Implementar lógica de upload dos arquivos traduzidos
      for (const file of Array.from(files)) {
        const originalFileName = file.name;
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
        const fileExt = originalFileName.substring(originalFileName.lastIndexOf('.'));
        const safeFileName = `${fileNameWithoutExt}_${timestamp}${fileExt}`.replace(/[^a-zA-Z0-9.-_]/g, '_');
        const filePath = `translated/${orderId}/${safeFileName}`;
        
        // Upload do arquivo
        const { error: uploadError } = await supabase.storage
          .from('arquivos_traduzidos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Atualizar o status da tradução para completed
        const { error: updateError } = await supabase
          .from('translationrequests')
          .update({ 
            status: 'completed',
          })
          .eq('request_id', orderId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Arquivos enviados com sucesso!",
        description: "Os arquivos traduzidos foram enviados e a tradução foi marcada como concluída.",
      });

      // Atualizar a lista de traduções
      fetchTranslations();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar arquivos",
        description: "Não foi possível enviar os arquivos traduzidos. Por favor, tente novamente.",
      });
    }
  };

  const handlePreviewClick = async (fileUrl: string) => {
    try {
      setPreviewLoading(true);
      const { data } = await supabase.storage
        .from('arquivos_carregados')
        .createSignedUrl(fileUrl, 60);

      if (data?.signedUrl) {
        setSelectedFileUrl(data.signedUrl);
        setShowPreview(true);
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao carregar preview",
          description: "Não foi possível gerar o preview do arquivo.",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar URL do arquivo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar preview",
        description: "Não foi possível gerar o preview do arquivo.",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenWorkspace = (requestId: string) => {
    navigate(`/translator/workspace/${requestId}`);
  };

  const filteredTranslations = translations.filter(translation => 
    translation.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${translation.source_language} para ${translation.target_language}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Minhas Traduções</h1>
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Procure aqui a sua tradução" 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Carregando traduções...</div>
        ) : filteredTranslations.length === 0 ? (
          <div className="text-center py-8">Nenhuma tradução encontrada.</div>
        ) : (
          filteredTranslations.map((translation) => (
            <TranslatorOrderCard
              key={translation.request_id}
              order={{
                id: translation.request_id,
                number: translation.request_id.slice(0, 8),
                date: format(new Date(translation.created_at), "dd/MM/yyyy - HH:mm", { locale: ptBR }),
                status: translation.status === 'in_progress' ? "Em Andamento" : "Concluído",
                service: {
                  type: translation.service_type,
                  languages: `${translation.source_language} para ${translation.target_language}`,
                  deadline: format(new Date(translation.delivery_date), "dd/MM/yyyy", { locale: ptBR }),
                },
                documents: [
                  { 
                    name: translation.file_name, 
                    size: `${translation.word_count} palavras`,
                    path: translation.file_path
                  },
                ],
                pricing: {
                  basePrice: translation.price_per_word * translation.word_count,
                  total: translation.total_price,
                },
              }}
              variant={translation.status === 'in_progress' ? "inProgress" : "history"}
              onUpload={translation.status === 'in_progress' ? (files) => handleUpload(files, translation.request_id) : undefined}
              onPreviewClick={handlePreviewClick}
              isLoading={previewLoading}
              onWorkspaceClick={() => handleOpenWorkspace(translation.request_id)}
            />
          ))
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview do Documento</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full min-h-[60vh]">
            {selectedFileUrl && (
              <iframe
                src={selectedFileUrl}
                className="w-full h-full border-0"
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTranslations;
