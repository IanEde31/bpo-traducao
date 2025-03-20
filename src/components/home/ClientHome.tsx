import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Calendar, FileCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { COLORS } from "@/constants/metrics";

interface Metric {
  title: string;
  value: number;
  label: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export function ClientHome() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        if (!user) return;

        // Buscar pedidos em andamento (status != 'Concluído')
        const { count: inProgressCount, error: inProgressError } = await supabase
          .from('translationrequests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'Concluído');

        if (inProgressError) throw inProgressError;

        // Buscar pedidos concluídos
        const { count: completedCount, error: completedError } = await supabase
          .from('translationrequests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'Concluído');

        if (completedError) throw completedError;

        const updatedMetrics: Metric[] = [
          {
            title: "Em Andamento",
            value: inProgressCount || 0,
            label: "Meus pedidos",
            icon: Calendar,
            iconBg: COLORS.status.pending.bg,
            iconColor: COLORS.status.pending.text,
            valueColor: COLORS.status.pending.text,
          },
          {
            title: "Concluídos",
            value: completedCount || 0,
            label: "Meus pedidos",
            icon: FileCheck,
            iconBg: COLORS.status.completed.bg,
            iconColor: COLORS.status.completed.text,
            valueColor: COLORS.status.completed.text,
          },
        ];

        setMetrics(updatedMetrics);
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [user]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Facilitando negócios, conectando culturas"
        description="Solicite sua tradução com apenas alguns cliques"
        buttonLabel="Faça um pedido"
        buttonHref="/novo-orcamento"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500">Carregando métricas...</p>
          </div>
        ) : (
          metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))
        )}
      </div>
    </div>
  );
}