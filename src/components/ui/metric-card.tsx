import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: number;
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export function MetricCard({
  title,
  value,
  label,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: MetricCardProps) {
  return (
    <Card className="p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`p-2 md:p-3 ${iconBg} rounded-lg`}>
          <Icon className={`h-5 w-5 md:h-6 md:w-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-medium text-gray-600">{title}</h3>
          <p className={`text-2xl md:text-3xl font-bold ${valueColor}`}>
            {value}
          </p>
          <p className="text-xs md:text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}
