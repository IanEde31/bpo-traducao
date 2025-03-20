import { useState, useEffect } from "react";
import { Search, Plus, Minus, Calendar, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Order {
  id: string;
  number: string;
  date: string;
  status: "Aguardando" | "Pendente" | "Concluído";
  service: {
    type: string;
    languages: string;
    deadline: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
  };
  documents: {
    name: string;
    size: string;
  }[];
  pricing: {
    basePrice: number;
    additional: number;
    discount: number;
    total: number;
  };
}

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "Aguardando":
      return "text-[#F97316]";
    case "Pendente":
      return "text-red-500";
    case "Concluído":
      return "text-[#4CAF50]";
    default:
      return "text-gray-500";
  }
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchOrders() {
      try {
        if (!user) return;

        const { data: translationRequests, error } = await supabase
          .from('translationrequests')
          .select(`
            *,
            users:user_id (
              name,
              email,
              phone
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'Concluído')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOrders: Order[] = translationRequests.map((request: any) => ({
          id: request.request_id,
          number: request.request_id.slice(0, 5),
          date: new Date(request.created_at).toLocaleString('pt-BR'),
          status: request.status,
          service: {
            type: request.service_type,
            languages: `${request.source_language} para ${request.target_language}`,
            deadline: new Date(request.deadline).toLocaleDateString('pt-BR'),
          },
          client: {
            name: request.users.name,
            email: request.users.email,
            phone: request.users.phone,
          },
          documents: [{
            name: request.file_name,
            size: `${Math.round(request.file_size / 1024)} Kb`,
          }],
          pricing: {
            basePrice: request.base_price || 0,
            additional: request.additional_cost || 0,
            discount: request.discount || 0,
            total: (request.base_price || 0) + (request.additional_cost || 0) - (request.discount || 0),
          },
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => 
    order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        heading="Meus pedidos"
        text="Acompanhe o status dos seus pedidos"
        buttonLabel="Fazer um pedido"
        buttonHref="/novo-orcamento"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Procure aqui o seu pedido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum pedido encontrado</p>
          <Button asChild className="mt-4 bg-[#23B0DE] hover:bg-[#198BAC]">
            <Link to="/novo-orcamento">
              Fazer um pedido
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span className="text-sm text-gray-600">Pedido número: {order.number}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Data: {order.date}</span>
                    </div>
                  </div>
                  <span className={`font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleOrder(order.id)}
                  className="text-gray-400 self-end md:self-center"
                >
                  {expandedOrder === order.id ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Detalhes do serviço</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{order.service.type}</p>
                        <p>{order.service.languages}</p>
                        <p>Entrega: {order.service.deadline}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Documentos</h3>
                      <ScrollArea className="h-[100px]">
                        <div className="space-y-2">
                          {order.documents.map((doc, index) => (
                            <div key={index} className="flex items-center gap-2 bg-[#E8F5E9] p-2 rounded">
                              <FileCheck className="h-4 w-4 text-[#4CAF50] flex-shrink-0" />
                              <span className="text-sm truncate">{doc.name}</span>
                              <span className="text-sm text-gray-500 flex-shrink-0">{doc.size}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Detalhes do cliente</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{order.client.name}</p>
                        <p>{order.client.email}</p>
                        <p>{order.client.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Valores</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>R$ {order.pricing.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Adicional:</span>
                          <span>R$ {order.pricing.additional.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Desconto:</span>
                          <span>R$ {order.pricing.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>R$ {order.pricing.total.toFixed(2)}</span>
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
    </div>
  );
}