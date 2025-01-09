import { useState } from "react";
import { Search, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface Quote {
  id: string;
  number: string;
  date: string;
  status: "Contratado";
  service: {
    type: string;
    languages: string;
    direction: string;
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

const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "22532",
    date: "13/04/2024 - 18:00",
    status: "Contratado",
    service: {
      type: "Técnico",
      languages: "Português para Inglês",
      direction: "Técnica",
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

export default function MyQuotes() {
  const [quotes] = useState<Quote[]>(mockQuotes);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleQuote = (quoteId: string) => {
    setExpandedQuote(expandedQuote === quoteId ? null : quoteId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Meus orçamentos</h1>
        <Button asChild className="bg-[#23B0DE] hover:bg-[#198BAC] text-white rounded-full">
          <Link to="/novo-orcamento">
            Fazer um orçamento
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Procure aqui o seu orçamento"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Você ainda não possui orçamentos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Orçamento número: {quote.number}</span>
                    <span className="text-sm text-gray-600">Data: {quote.date}</span>
                  </div>
                  <span className="text-[#4CAF50] font-medium">{quote.status}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleQuote(quote.id)}
                  className="text-gray-400"
                >
                  {expandedQuote === quote.id ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedQuote === quote.id && (
                <div className="mt-4 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Detalhes do serviço</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{quote.service.type}</p>
                        <p>{quote.service.languages}</p>
                        <p>{quote.service.direction}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Documentos</h3>
                      <div className="space-y-2">
                        {quote.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 bg-[#E8F5E9] p-2 rounded">
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
                        <p>{quote.client.name}</p>
                        <p>{quote.client.email}</p>
                        <p>{quote.client.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Preço</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Preço base:</span>
                          <span>R$ {quote.pricing.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adicional:</span>
                          <span>R$ {quote.pricing.additional.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Desconto:</span>
                          <span>R$ {quote.pricing.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-base">
                          <span>Total:</span>
                          <span className="text-[#23B0DE]">R$ {quote.pricing.total.toFixed(2)}</span>
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