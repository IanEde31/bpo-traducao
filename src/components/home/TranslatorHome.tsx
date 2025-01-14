import { Card } from "@/components/ui/card";
import { FileText, Calendar, FileCheck } from "lucide-react";

export function TranslatorHome() {
  const translatorMetrics = [
    {
      title: "Orçamentos",
      value: 0,
      label: "Pendentes",
      icon: FileText,
      iconBg: "bg-[#FFF5E6]",
      iconColor: "text-[#F97316]",
      valueColor: "text-[#F97316]",
    },
    {
      title: "Minhas traduções",
      value: 0,
      label: "Em andamento",
      icon: Calendar,
      iconBg: "bg-[#E3F2FD]",
      iconColor: "text-[#2196F3]",
      valueColor: "text-[#2196F3]",
    },
    {
      title: "Minhas traduções",
      value: 0,
      label: "Concluídas",
      icon: FileCheck,
      iconBg: "bg-[#E8F5E9]",
      iconColor: "text-[#4CAF50]",
      valueColor: "text-[#4CAF50]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-secondary rounded-lg p-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-600">
            Facilitando negócios, conectando culturas
          </h1>
          <p className="text-gray-500 mt-1">
            Acompanhe aqui as solicitações de tradução
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {translatorMetrics.map((metric, index) => (
          <Card key={index} className="p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${metric.iconBg} rounded-lg`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
              <div>
                <h3 className="font-medium text-gray-600">{metric.title}</h3>
                <p className={`text-3xl font-bold ${metric.valueColor}`}>
                  {metric.value}
                </p>
                <p className="text-sm text-gray-500">{metric.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}