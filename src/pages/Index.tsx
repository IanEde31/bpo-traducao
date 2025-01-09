import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, FileCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Facilitando negócios, conectando culturas</h1>
          <p className="text-gray-500 mt-1">Solicite sua tradução com apenas alguns cliques</p>
        </div>
        <Button>Faça um pedido</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Novos pedidos</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500">Aguardando</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary rounded-lg">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Meus pedidos</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500">Concluídos</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;