import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // CORS configuration
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Apply CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    
    // Log de diagnóstico (seguro: mostra o início para comparar contas)
    const keyPrefix = stripeSecret ? stripeSecret.substring(0, 15) : 'NULO';
    console.log(`[DIAGNOSTICO] Stripe Key inicia com: ${keyPrefix}`);

    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY não configurada na Vercel');
    }

    const stripe = new Stripe(stripeSecret.trim(), {
      apiVersion: '2025-01-27.acacia' as any,
    });

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'priceId é obrigatório' });
    }
    
    const cleanPriceId = priceId.trim();
    console.log(`[DIAGNOSTICO] Usando Price ID: [${cleanPriceId}] (Tamanho: ${cleanPriceId.length})`);

    // TESTE: Listar preços ativos para ver o que a API enxerga
    try {
      const activePrices = await stripe.prices.list({ limit: 5, active: true });
      console.log('[DIAGNOSTICO] Preços ativos encontrados na conta:', activePrices.data.map(p => p.id).join(', '));
    } catch (e) {
      console.warn('[DIAGNOSTICO] Falha ao listar preços:', e);
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

    console.log(`Criando sessão para: ${cleanPriceId}, Usuário: ${userId}`);

    // Create checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: cleanPriceId,
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
    } catch (stripeError: any) {
      console.error('Erro detalhado do Stripe:', stripeError);
      return res.status(400).json({ 
        error: stripeError.message,
        details: `ID: ${cleanPriceId} | Code: ${stripeError.code} | Type: ${stripeError.type}`,
        code: stripeError.code
      });
    }
  } catch (error: any) {
    console.error('Erro na função create-checkout-session:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
