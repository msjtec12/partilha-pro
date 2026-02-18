import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req: any, res: any) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'priceId é obrigatório' });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada no Vercel' });
    }

    // Tenta obter os dados do usuário via header Authorization
    const authHeader = req.headers.authorization;
    let userEmail = undefined;
    let userId = 'anonymous';

    if (authHeader) {
      try {
        const supabaseClient = createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_ANON_KEY || ''
        );

        // O token JWT vem como "Bearer <token>"
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        
        if (user) {
          userEmail = user.email;
          userId = user.id;
        }
      } catch (authError: any) {
        console.warn('Erro ao validar auth:', authError.message);
      }
    }

    console.log(`Criando sessão para: ${priceId}, Usuário: ${userId}`);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/ajustes?success=true`,
      cancel_url: `${req.headers.origin}/ajustes?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Erro na função create-checkout-session:', error.message);
    return res.status(400).json({ error: error.message });
  }
}
