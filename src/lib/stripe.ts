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
    throw error;
  }
  
  if (data?.url) {
    window.location.href = data.url;
  } else {
    throw new Error('Link de checkout não recebido');
  }
};

