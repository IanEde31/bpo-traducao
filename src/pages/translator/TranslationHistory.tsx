import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TranslatorOrderCard } from "@/components/orders/TranslatorOrderCard";

const mockOrders = [
  {
    id: "1",
    number: "22532",
    date: "15/04/2024 - 18:00",
    status: "Concluído" as const,
    service: {
      type: "Técnico",
      languages: "Português para Inglês",
      deadline: "28/04/2024",
    },
    documents: [
      { name: "teste_do_projeto.pdf", size: "525 Kb" },
      { name: "teste_do_projeto_traduzido.pdf", size: "525 Kb" },
    ],
    pricing: {
      total: 250.00,
    },
  },
];

const TranslationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Histórico de Traduções</h1>
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
        {mockOrders.map((order) => (
          <TranslatorOrderCard
            key={order.id}
            order={order}
            variant="history"
          />
        ))}
      </div>
    </div>
  );
};

export default TranslationHistory;
