import { useState, useEffect } from "react";
import { Search, FileText, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: number;
  label: string;
  bgColor: string;
  iconColor: string;
  Icon: any;
}

function MetricCard({ title, value, label, bgColor, iconColor, Icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-600">{title}</h3>
          <p className={`text-3xl font-bold ${iconColor}`}>{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function TranslatorHome() {
  const [metrics, setMetrics] = useState({
    available: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        if (!user) return;

        // Primeiro, buscar o translator_id do usuário atual
        const { data: translatorData, error: translatorError } = await supabase
          .from('translators')
          .select('translator_id')
          .eq('user_id', user.id)
          .single();

        if (translatorError) {
          console.error('Erro ao buscar dados do tradutor:', translatorError);
          throw translatorError;
        }

        if (!translatorData?.translator_id) {
          console.error('Tradutor não encontrado para o usuário atual');
          return;
        }

        const translatorId = translatorData.translator_id;

        // Buscar pedidos disponíveis (sem tradutor associado)
        const { data: availableData, error: availableError } = await supabase
          .from('translationrequests')
          .select('*')
          .is('translator_id', null)
          .eq('status', 'pending');

        if (availableError) {
          console.error('Erro ao buscar pedidos disponíveis:', availableError);
          throw availableError;
        }

        // Buscar pedidos em andamento do tradutor
        const { data: inProgressData, error: inProgressError } = await supabase
          .from('translationrequests')
          .select('*')
          .eq('translator_id', translatorId)
          .eq('status', 'in_progress');

        if (inProgressError) {
          console.error('Erro ao buscar pedidos em andamento:', inProgressError);
          throw inProgressError;
        }

        // Buscar pedidos concluídos do tradutor
        const { data: completedData, error: completedError } = await supabase
          .from('translationrequests')
          .select('*')
          .eq('translator_id', translatorId)
          .eq('status', 'completed');

        if (completedError) {
          console.error('Erro ao buscar pedidos concluídos:', completedError);
          throw completedError;
        }

        // Log detalhado para debug
        console.log('Dados completos:', {
          translatorData,
          availableData,
          inProgressData,
          completedData
        });

        setMetrics({
          available: availableData?.length || 0,
          inProgress: inProgressData?.length || 0,
          completed: completedData?.length || 0
        });

      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [user]);

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
          onClick={() => navigate('/translator/pedidos-disponiveis')}
          className="bg-[#23B0DE] hover:bg-[#198BAC] text-white rounded-full"
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar pedidos
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando métricas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Pedidos disponíveis"
            value={metrics.available}
            label="Pedidos disponíveis"
            bgColor="bg-[#FFF5E6]"
            iconColor="text-[#F97316]"
            Icon={FileText}
          />
          <MetricCard
            title="Em Andamento"
            value={metrics.inProgress}
            label="Minhas traduções"
            bgColor="bg-[#E3F2FD]"
            iconColor="text-[#2196F3]"
            Icon={Clock}
          />
          <MetricCard
            title="Concluídas"
            value={metrics.completed}
            label="Minhas traduções"
            bgColor="bg-[#E8F5E9]"
            iconColor="text-[#4CAF50]"
            Icon={CheckCircle}
          />
        </div>
      )}
    </div>
  );
}