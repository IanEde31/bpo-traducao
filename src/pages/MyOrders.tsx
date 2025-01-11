import { useState } from "react";
import { Search, Plus, Minus, Calendar, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

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

const mockOrders: Order[] = [
  {
    id: "1",
    number: "22532",
    date: "13/04/2024 - 18:00",
    status: "Aguardando",
    service: {
      type: "Técnico",
      languages: "Português para Inglês",
      deadline: "20/04/2024",
    },
    client: {
      name: "José Silva",
      email: "cliente@gmail.com",
      phone: "(11) 99123-4567",
    },
    documents: [
      { name: "nome_do_arquivo.pdf", size: "525 Kb" },
      { name: "nome_do_arquivo.pdf", size: "525 Kb" },
    ],
    pricing: {
      basePrice: 220.00,
      additional: 35.00,
      discount: 0.00,
      total: 255.00,
    },
  },
  {
    id: "2",
    number: "22532",
    date: "13/04/2024 - 18:00",
    status: "Pendente",
    service: {
      type: "Técnico",
      languages: "Português para Inglês",
      deadline: "20/04/2024",
    },
    client: {
      name: "José Silva",
      email: "cliente@gmail.com",
      phone: "(11) 99123-4567",
    },
    documents: [
      { name: "nome_do_arquivo.pdf", size: "525 Kb" },
      { name: "nome_do_arquivo.pdf", size: "525 Kb" },
    ],
    pricing: {
      basePrice: 220.00,
      additional: 35.00,
      discount: 0.00,
      total: 255.00,
    },
  },
];

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "Aguardando":
      return "text-[#F97316]"; // Orange
    case "Pendente":
      return "text-red-500"; // Red
    case "Concluído":
      return "text-[#4CAF50]"; // Green
    default:
      return "text-gray-500";
  }
};

export default function MyOrders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Meus pedidos</h1>
        <Button asChild className="bg-[#23B0DE] hover:bg-[#198BAC] text-white rounded-full">
          <Link to="/novo-orcamento">
            Fazer um pedido
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Procure aqui o seu pedido"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Você ainda não possui pedidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-4">
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
                  className="text-gray-400"
                >
                  {expandedOrder === order.id ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-4 grid grid-cols-2 gap-8">
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
                      <div className="space-y-2">
                        {order.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 bg-[#E8F5E9] p-2 rounded">
                            <FileCheck className="h-4 w-4 text-[#4CAF50]" />
                            <span className="text-sm">{doc.name}</span>
                            <span className="text-sm text-gray-500">{doc.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Informações do cliente</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{order.client.name}</p>
                        <p>{order.client.email}</p>
                        <p>{order.client.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Preço</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Preço base:</span>
                          <span>R$ {order.pricing.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adicional:</span>
                          <span>R$ {order.pricing.additional.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Desconto:</span>
                          <span>R$ {order.pricing.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-base">
                          <span>Total:</span>
                          <span className="text-[#23B0DE]">R$ {order.pricing.total.toFixed(2)}</span>
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