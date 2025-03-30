/**
 * Componente de botão para iniciar o checkout do Stripe
 * 
 * Este componente renderiza um botão que, quando clicado, mostra uma mensagem informativa
 * sobre a integração com Stripe (placeholder).
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CheckoutButtonProps {
  requestId: string;
  amount: number; 
  customerEmail: string;
  customerName: string;
  description?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  className?: string;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  amount,
  description = 'Serviço de Tradução',
  variant = 'default',
  className,
}) => {
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
      title: "Integração com Stripe",
      description: "A integração de pagamentos será implementada em breve. Valor a ser pago: R$ " + amount.toFixed(2),
    });
  };

  return (
    <Button 
      onClick={handleCheckout} 
      variant={variant}
      className={className}
    >
      Realizar Pagamento (Demonstração)
    </Button>
  );
};
