import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({ error: 'analysisId is required' });
    }

    // Get the origin for redirect URLs
    const origin = req.headers.origin || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Multas Zero - Desbloqueio de Defesa',
              description: 'Acesso completo: erros detalhados, carta de defesa e guia passo-a-passo',
            },
            unit_amount: 245, // 2.45€ in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}&analysis_id=${analysisId}`,
      cancel_url: `${origin}/?canceled=true&analysis_id=${analysisId}`,
      metadata: {
        analysisId,
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session'
    });
  }
}
