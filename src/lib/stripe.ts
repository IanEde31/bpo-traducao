/**
 * Configuração do Stripe para processamento de pagamentos
 * 
 * Este módulo centraliza a configuração do Stripe e fornece funções
 * para criar sessões de checkout e processar pagamentos.
 */
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Carrega a chave pública do Stripe do ambiente
const stripePublicKey = import.meta.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '';

// Inicializa a instância do Stripe
let stripePromise: Promise<Stripe | null>;

/**
 * Retorna uma Promise para a instância do Stripe
 * Isso permite o carregamento assíncrono da biblioteca
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

/**
 * Interface para os dados necessários para criar uma sessão de checkout
 */
export interface CheckoutSessionParams {
  requestId: string;
  amount: number; // em centavos
  customerId?: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

/**
 * Cria uma sessão de checkout do Stripe
 * Esta função deve ser chamada através de um endpoint de API
 */
export const createCheckoutSession = async (params: CheckoutSessionParams) => {
  try {
    // Em um ambiente Vite, precisamos usar endpoints diferentes
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar sessão de checkout');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
};

/**
 * Redireciona o usuário para a página de checkout do Stripe
 */
export const redirectToCheckout = async (sessionId: string) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Falha ao carregar Stripe');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao redirecionar para checkout:', error);
    throw error;
  }
};
