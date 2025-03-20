import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { OrderCard } from "@/components/orders/OrderCard";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
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

export function ClientOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
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

        setOrders(data || []);
        setFilteredOrders(data || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar pedidos",
          description: "Não foi possível carregar seus pedidos. Por favor, tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Configurar inscrição em tempo real para atualizações de pedidos
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('translationrequests-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'translationrequests',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // Atualizar a lista de pedidos quando houver alterações
            fetchOrders();
            
            // Enviar notificação para o usuário sobre mudança de status
            if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old.status) {
              const statusMessages = {
                'pending': 'Seu pedido está pendente de aprovação',
                'approved': 'Seu pedido foi aprovado',
                'in_progress': 'Seu pedido está em andamento',
                'completed': 'Seu pedido foi concluído',
                'canceled': 'Seu pedido foi cancelado',
              };
              
              const message = statusMessages[payload.new.status] || `Status do pedido alterado para ${payload.new.status}`;
              const type = payload.new.status === 'completed' ? 'success' : 
                        payload.new.status === 'canceled' ? 'error' : 
                        payload.new.status === 'approved' ? 'success' : 'info';
              
              // Criar notificação
              supabase
                .from('notifications')
                .insert({
                  user_id: user.id,
                  message: `${message} (ID: ${payload.new.request_id})`,
                  type,
                  link: `/pedidos/${payload.new.id}`,
                  read: false
                })
                .then(({ error }) => {
                  if (error) console.error('Erro ao criar notificação:', error);
                });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribe = setupSubscription();
    return () => {
      if (unsubscribe) {
        unsubscribe.then(fn => fn && fn());
      }
    };
  }, [navigate, toast]);

  // Filtrar pedidos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = orders.filter(order => 
        order.request_id.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.customer_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.service_type.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.status.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  // Função para formatar o status para exibição
  const formatStatus = (status: string) => {
    const statusMap = {
      'pending': 'pending',
      'approved': 'inProgress',
      'in_progress': 'inProgress',
      'completed': 'completed',
      'canceled': 'rejected'
    };
    
    return statusMap[status] || 'pending';
  };

  // Converter um pedido do banco de dados para o formato esperado pelo componente OrderCard
  const mapOrderToCardFormat = (order: Order) => {
    return {
      orderNumber: order.request_id,
      date: new Date(order.created_at).toLocaleString('pt-BR'),
      status: formatStatus(order.status),
      service: {
        type: `${order.source_language} para ${order.target_language}`,
        deadline: new Date(order.delivery_date).toLocaleDateString('pt-BR'),
      },
      client: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      documents: [
        { name: order.file_name, size: `${Math.round(order.file_size / 1024)} kb` },
      ],
      price: {
        subtotal: order.total_price,
        tax: 0,
        total: order.total_price,
      },
    };
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        heading="Pedidos"
        text="Visualize e acompanhe seus pedidos"
      />

      <div className="flex items-center gap-3 bg-white rounded-lg p-3 md:p-4 shadow-sm">
        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <Input 
          type="text"
          placeholder="Procure aqui o seu pedido"
          className="border-0 focus-visible:ring-0 px-0 h-auto"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3 md:space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              {...mapOrderToCardFormat(order)}
              variant="client"
              className="transition-all hover:shadow-md"
              onClick={() => navigate(`/pedidos/${order.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ClientOrders;
