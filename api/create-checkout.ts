import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({ error: 'analysisId is required' });
    }

    // Get the origin for redirect URLs
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://copy-of-multas-zero.vercel.app';

    // Use Stripe API directly via fetch
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': 'Multas Zero - Desbloqueio de Defesa',
        'line_items[0][price_data][product_data][description]': 'Acesso completo: erros detalhados, carta de defesa e guia passo-a-passo',
        'line_items[0][price_data][unit_amount]': '245',
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}&analysis_id=${analysisId}`,
        'cancel_url': `${origin}/?canceled=true&analysis_id=${analysisId}`,
        'metadata[analysisId]': analysisId,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', data);
      return res.status(500).json({
        error: 'Stripe error',
        details: data.error?.message || 'Unknown error'
      });
    }

    return res.status(200).json({
      sessionId: data.id,
      url: data.url
    });
  } catch (error: any) {
    console.error('Checkout error:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error?.message || 'Unknown error'
    });
  }
}
