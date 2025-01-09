import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-secondary rounded-lg p-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-600">Facilitando negócios, conectando culturas</h1>
          <p className="text-gray-500 mt-1">Solicite sua tradução com apenas alguns cliques</p>
        </div>
        <Link to="/novo-orcamento">
          <Button className="bg-[#23B0DE] hover:bg-[#198BAC] text-white rounded-full">
            Faça um pedido
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#FFF5E6] rounded-lg">
              <Calendar className="h-6 w-6 text-[#F97316]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Andamento</h3>
              <p className="text-3xl font-bold text-[#F97316]">0</p>
              <p className="text-sm text-gray-500">Meus pedidos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#E8F5E9] rounded-lg">
              <FileCheck className="h-6 w-6 text-[#4CAF50]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Concluídos</h3>
              <p className="text-3xl font-bold text-[#4CAF50]">0</p>
              <p className="text-sm text-gray-500">Meus pedidos</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;