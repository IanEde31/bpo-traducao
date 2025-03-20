import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TranslatorOrderCard } from "@/components/orders/TranslatorOrderCard";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
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

interface Order {
  id: string;
  number: string;
  date: string;
  status: string;
  service: {
    type: string;
    languages: string;
    deadline: string;
  };
  documents: {
    name: string;
    size: string;
    path: string;
  }[];
  pricing: {
    basePrice: number;
    total: number;
  };
}

const AvailableOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<TranslationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [acceptingOrder, setAcceptingOrder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('translationrequests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar pedidos",
        description: "Não foi possível carregar os pedidos disponíveis. Por favor, tente novamente.",
      });
    } finally {
      setLoading(false);
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

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setAcceptingOrder(true);
      
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

      // Atualizar o status da tradução e atrelar ao tradutor
      const { error: updateError } = await supabase
        .from('translationrequests')
        .update({ 
          status: 'in_progress',
          translator_id: translatorData.translator_id 
        })
        .eq('request_id', orderId);

      if (updateError) throw updateError;

      toast({
        title: "Pedido aceito com sucesso!",
        description: "A tradução foi adicionada à sua lista de traduções.",
      });

      // Atualizar a lista de pedidos
      fetchOrders();
      
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      toast({
        variant: "destructive",
        title: "Erro ao aceitar pedido",
        description: "Não foi possível aceitar o pedido. Por favor, tente novamente.",
      });
    } finally {
      setAcceptingOrder(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.source_language} para ${order.target_language}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos Disponíveis</h1>
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Procure aqui o seu pedido" 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Carregando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">Nenhum pedido disponível encontrado.</div>
        ) : (
          filteredOrders.map((order) => (
            <TranslatorOrderCard
              key={order.request_id}
              order={{
                id: order.request_id,
                number: order.request_id.slice(0, 8),
                date: format(new Date(order.created_at), "dd/MM/yyyy - HH:mm", { locale: ptBR }),
                status: "Disponível",
                service: {
                  type: order.service_type,
                  languages: `${order.source_language} para ${order.target_language}`,
                  deadline: format(new Date(order.delivery_date), "dd/MM/yyyy", { locale: ptBR }),
                },
                documents: [
                  { 
                    name: order.file_name, 
                    size: `${order.word_count} palavras`,
                    path: order.file_path
                  },
                ],
                pricing: {
                  basePrice: order.price_per_word * order.word_count,
                  total: order.total_price,
                },
              }}
              onPreviewClick={handlePreviewClick}
              isLoading={previewLoading}
              variant="available"
              onAcceptOrder={handleAcceptOrder}
              acceptingOrder={acceptingOrder}
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

export default AvailableOrders;
