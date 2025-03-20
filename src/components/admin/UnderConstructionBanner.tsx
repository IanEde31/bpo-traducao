import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function UnderConstructionBanner() {
  return (
    <div className="relative w-full py-4 mb-6 overflow-hidden rounded-lg">
      {/* Faixa diagonal amarela e preta */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #f59e0b 10px, #f59e0b 20px)',
          opacity: 0.2,
          zIndex: -1
        }}
      />
      
      <div className="flex items-center justify-center px-4 py-3 space-x-4 bg-yellow-50 border-2 border-yellow-400">
        <div className="flex items-center justify-center p-2 rounded-full bg-yellow-400">
          <AlertTriangle className="w-6 h-6 text-yellow-900" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-yellow-900">Página em Construção</h3>
          <p className="text-yellow-800">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
