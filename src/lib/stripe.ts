import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const redirectToCheckout = async (priceId: string) => {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');

  // Obter a sessão atual para enviar o token de autenticação
  const { data: { session: authSession } } = await supabase.auth.getSession();

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authSession?.access_token}`,
    },
    body: JSON.stringify({ priceId }),
  });
  
  const data = await response.json();

  if (!response.ok) {
    console.error('Error creating checkout session:', data.error, data.details);
    const fullError = data.details ? `${data.error} (${data.details})` : (data.error || 'Erro ao processar pagamento');
    throw new Error(fullError);
  }
  
  if (data?.url) {
    window.location.href = data.url;
  } else {
    throw new Error('Link de checkout não recebido');
  }
};

