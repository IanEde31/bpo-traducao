import React from 'react';
import { UnderConstructionBanner } from '@/components/admin/UnderConstructionBanner';
import { BarChart, FileText, UserRound, CircleDollarSign } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <UnderConstructionBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cards de métricas (placeholder) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <UserRound className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuários</p>
              <h3 className="text-2xl font-bold">--</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos</p>
              <h3 className="text-2xl font-bold">--</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <BarChart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Traduções Concluídas</p>
              <h3 className="text-2xl font-bold">--</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <CircleDollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Faturamento</p>
              <h3 className="text-2xl font-bold">--</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300">
            <p className="text-gray-400">Dados indisponíveis no momento</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Distribuição de Idiomas</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300">
            <p className="text-gray-400">Dados indisponíveis no momento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
