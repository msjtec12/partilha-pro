import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const redirectToCheckout = async (priceId: string) => {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { priceId }
  });
  
  if (error) {
    console.error('Error creating checkout session:', error);
    // Tenta extrair a mensagem de erro da resposta se possível
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
    throw new Error(errorMessage);
  }
  
  if (data?.url) {
    window.location.href = data.url;
  } else if (data?.error) {
    throw new Error(data.error);
  } else {
    throw new Error('Link de checkout não recebido');
  }
};

