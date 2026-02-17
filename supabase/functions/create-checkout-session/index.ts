import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {

  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


serve(async (req) => {
  // Configurando CORS completo
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Corpo da requisição inválido");
    }

    const { priceId } = body;
    if (!priceId) {
      throw new Error("priceId é obrigatório");
    }

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      throw new Error("STRIPE_SECRET_KEY não configurada no Supabase Secrets");
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Tenta obter os dados do usuário mas não bloqueia se falhar
    const authHeader = req.headers.get("Authorization");
    let userEmail = undefined;
    let userId = "anonymous";

    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          userEmail = user.email;
          userId = user.id;
        }
      } catch (authError) {
        console.warn("Erro ao validar auth:", authError.message);
      }
    }

    console.log(`Criando sessão para: ${priceId}, Usuário: ${userId}`);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/ajustes?success=true`,
      cancel_url: `${req.headers.get("origin")}/ajustes?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na função create-checkout-session:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});


