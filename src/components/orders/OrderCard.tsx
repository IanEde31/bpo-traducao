import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderCardProps {
  orderNumber: string;
  date: string;
  status: "pending" | "inProgress" | "completed";
  service: {
    type: string;
    deadline: string;
  };
  client?: {
    name: string;
    email: string;
    phone: string;
  };
  documents: Array<{
    name: string;
    size: string;
  }>;
  price: {
    subtotal: number;
    tax?: number;
    total: number;
  };
  variant: "client" | "translator";
  className?: string;
  onClick?: () => void;
}

const STATUS_STYLES = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    label: "Pendente"
  },
  inProgress: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Em andamento"
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Concluído"
  }
};

export function OrderCard({
  orderNumber,
  date,
  status,
  service,
  client,
  documents,
  price,
  variant,
  className = "",
  onClick
}: OrderCardProps) {
  const statusStyle = STATUS_STYLES[status];

  return (
    <Card 
      className={`w-full p-6 overflow-hidden ${className}`}
      onClick={onClick}
      {...(onClick ? { role: "button", tabIndex: 0 } : {})}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">Pedido número: {orderNumber}</span>
            <span className="text-gray-400">Data: {date}</span>
          </div>
          <Badge 
            variant="secondary" 
            className={`mt-2 ${statusStyle.bg} ${statusStyle.text} border-0`}
          >
            {statusStyle.label}
          </Badge>
        </div>
        {variant === "translator" && (
          <div className="text-right">
            <span className="text-sm text-gray-500">Valor</span>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(price.total)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Detalhes do serviço</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Serviço: {service.type}</p>
            <p>Entrega: {service.deadline}</p>
          </div>

          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Documentos</h4>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <FileText className="h-4 w-4 text-green-500" />
                  <span>{doc.name}</span>
                  <span className="text-gray-400">({doc.size})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {variant === "client" && (
          <>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Informações do cliente</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{client?.name}</p>
                <p>{client?.email}</p>
                <p>{client?.phone}</p>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">Preço</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor base:</span>
                  <span className="text-gray-900">{formatCurrency(price.subtotal)}</span>
                </div>
                {price.tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impostos:</span>
                    <span className="text-gray-900">{formatCurrency(price.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">Total:</span>
                  <span className="text-primary">{formatCurrency(price.total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
