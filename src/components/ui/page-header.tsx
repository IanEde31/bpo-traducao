import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  // Propriedades originais
  title?: string;
  description?: string;
  // Propriedades alternativas para compatibilidade
  heading?: string;
  text?: string;
  // Outras propriedades
  buttonLabel?: string;
  buttonIcon?: LucideIcon;
  buttonHref?: string;
}

export function PageHeader({
  title,
  description,
  heading,
  text,
  buttonLabel,
  buttonIcon: Icon,
  buttonHref,
}: PageHeaderProps) {
  // Usar heading como fallback para title e text como fallback para description
  const displayTitle = title || heading || "";
  const displayDescription = description || text || "";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary rounded-lg p-4 md:p-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-primary-600">
          {displayTitle}
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          {displayDescription}
        </p>
      </div>
      {buttonLabel && buttonHref && (
        <Link to={buttonHref}>
          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white rounded-full text-sm md:text-base">
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {buttonLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
