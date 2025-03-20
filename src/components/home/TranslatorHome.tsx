import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TranslatorHome() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-secondary rounded-lg p-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-600">
            Facilitando negócios, conectando culturas
          </h1>
          <p className="text-gray-500 mt-1">
            Acompanhe suas traduções e pedidos disponíveis
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/translator/pedidos-disponiveis'}
          className="bg-[#23B0DE] hover:bg-[#198BAC] text-white rounded-full"
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar pedidos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#FFF5E6] rounded-lg">
              <svg className="h-6 w-6 text-[#F97316]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Pendentes</h3>
              <p className="text-3xl font-bold text-[#F97316]">3</p>
              <p className="text-sm text-gray-500">Pedidos disponíveis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#E3F2FD] rounded-lg">
              <svg className="h-6 w-6 text-[#2196F3]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Em Andamento</h3>
              <p className="text-3xl font-bold text-[#2196F3]">0</p>
              <p className="text-sm text-gray-500">Minhas traduções</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#E8F5E9] rounded-lg">
              <svg className="h-6 w-6 text-[#4CAF50]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Concluídas</h3>
              <p className="text-3xl font-bold text-[#4CAF50]">0</p>
              <p className="text-sm text-gray-500">Minhas traduções</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}