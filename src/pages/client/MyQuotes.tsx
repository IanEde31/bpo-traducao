import { useEffect, useState, useContext } from "react";
import { Search, Plus, Minus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { UserTypeContext } from "@/App";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Quote {
  request_id: string;
  created_at: string;
  status: string;
  service_type: string;
  source_language: string;
  target_language: string;
  translation_subtype: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  file_name: string;
  file_size: number;
  file_path: string;
  word_count: number;
  price_per_word: number;
  total_price: number;
  delivery_date: string;
  user_id: string;
}

const STATUS_COLORS = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  'pending': 'Pendente',
  'in_progress': 'Em andamento',
  'completed': 'Concluído',
  'cancelled': 'Cancelado',
};

export default function MyQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useContext(UserTypeContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuotes();
  }, [isAuthenticated, navigate]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('translationrequests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar orçamentos",
        description: "Não foi possível carregar seus orçamentos. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuote = (quoteId: string) => {
    setExpandedQuote(expandedQuote === quoteId ? null : quoteId);
  };

  const handlePreviewClick = async (fileUrl: string) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => 
    quote.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${quote.source_language} para ${quote.target_language}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        heading="Meus orçamentos"
        text="Acompanhe seus orçamentos e faça novos pedidos"
        buttonLabel="Fazer um orçamento"
        buttonHref="/novo-orcamento"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Procure aqui o seu orçamento"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando orçamentos...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "Nenhum orçamento encontrado" : "Você ainda não possui orçamentos"}
          </p>
          <Button asChild className="mt-4 bg-[#23B0DE] hover:bg-[#198BAC]">
            <Link to="/novo-orcamento">
              Fazer um orçamento
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.request_id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span className="text-sm text-gray-600">
                      Orçamento: #{quote.request_id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Data: {format(new Date(quote.created_at), "dd/MM/yyyy - HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <Badge className={STATUS_COLORS[quote.status as keyof typeof STATUS_COLORS]}>
                    {STATUS_LABELS[quote.status as keyof typeof STATUS_LABELS]}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleQuote(quote.request_id)}
                  className="text-gray-400 self-end md:self-center"
                >
                  {expandedQuote === quote.request_id ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedQuote === quote.request_id && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Detalhes do serviço</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Tipo: {quote.service_type}</p>
                        <p>De: {quote.source_language} para {quote.target_language}</p>
                        {quote.translation_subtype && (
                          <p>Subtipo: {quote.translation_subtype}</p>
                        )}
                        <p>Entrega: {format(new Date(quote.delivery_date), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Arquivo</h3>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{quote.file_name}</p>
                          <p className="text-xs text-gray-500">
                            {Math.round(quote.file_size / 1024)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreviewClick(quote.file_path)}
                          className="flex-shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Detalhes do cliente</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{quote.customer_name}</p>
                        <p>{quote.customer_email}</p>
                        <p>{quote.customer_phone}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Valores</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantidade de palavras:</span>
                          <span>{quote.word_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preço por palavra:</span>
                          <span>R$ {quote.price_per_word.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>R$ {quote.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Visualização do arquivo</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {selectedFileUrl && (
              <iframe
                src={selectedFileUrl}
                className="w-full h-full"
                title="Visualização do arquivo"
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}