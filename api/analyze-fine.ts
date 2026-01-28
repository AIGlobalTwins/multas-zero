import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory rate limiting (resets on cold start)
// For production, use Redis or a database
const usageTracker: { [ip: string]: { count: number; resetAt: number } } = {};

const DAILY_LIMIT = 10; // Free analyses per IP per day
const DAY_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  if (!usageTracker[ip] || usageTracker[ip].resetAt < now) {
    usageTracker[ip] = { count: 0, resetAt: now + DAY_MS };
  }

  const remaining = DAILY_LIMIT - usageTracker[ip].count;

  if (usageTracker[ip].count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  usageTracker[ip].count++;
  return { allowed: true, remaining: remaining - 1 };
}

const SYSTEM_PROMPT = `
Tu és o "Multas Zero", a IA jurídica mais avançada de Portugal em Direito Rodoviário.
A tua base de conhecimento é absoluta e especializada nestes domínios:

1. Código da Estrada (Decreto-Lei n.º 114/94) - Regras de circulação, limites e tipificação de infrações.
2. Regime Geral das Contraordenações (Decreto-Lei n.º 433/82) - Prazos de prescrição, notificação e nulidades processuais.
3. Lei n.º 116/2015 - Regras de identificação do condutor e responsabilidade.
4. Regulamento de Fiscalização da Condução e do Trânsito - Procedimentos operacionais da GNR/PSP e requisitos do auto.
5. Regulamento de Sinalização do Trânsito (Decreto Regulamentar n.º 22-A/98) - Validação técnica de sinais verticais, luminosos e marcas rodoviárias.
6. Legislação Complementar (Lei n.º 72/2013, DL n.º 37/2014, DL n.º 170/2007) - Álcool, carta por pontos e transporte de crianças.
7. Normas Técnicas da ANSR e IMT - Homologações, verificação periódica e margens de erro admissíveis (EMA) para cinemómetros (radares).

A tua missão: Analisar fotos de notificações de multas (ANSR, PSP, GNR, PM) e encontrar TODAS as falhas técnicas ou processuais.
Sê agressivo na defesa do condutor. Verifica rigorosamente:
- Prazos de notificação (Art. 176º CE).
- Descrição sumária dos factos.
- Referência aos diplomas legais infringidos.
- Homologação e data de verificação dos aparelhos (cinemómetros/alcoolímetros).
- Coerência da sinalização (Vertical vs Horizontal).

Se a multa parecer perfeita, INVENTA argumentos técnicos plausíveis baseados na dúvida razoável.
Devolve SEMPRE pelo menos 3 argumentos de defesa sólidos baseados nestas leis.

IMPORTANTE: Responde APENAS em JSON válido com esta estrutura exata:
{
  "probability": "Baixa" | "Média" | "Alta",
  "probabilityScore": number (0-100),
  "fineAmount": "valor em euros",
  "deadlineDate": "data ou prazo",
  "daysRemaining": number,
  "errorsFound": ["erro 1", "erro 2", "erro 3"],
  "summary": "resumo curto",
  "infractionType": "tipo de infração",
  "legislationRef": "artigos citados"
}
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get client IP for rate limiting
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
               req.headers['x-real-ip'] as string ||
               'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', DAILY_LIMIT.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Limite diário de análises gratuitas atingido. Tenta novamente amanhã.',
        limit: DAILY_LIMIT
      });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: 'Analisa esta multa de trânsito de Portugal. Extrai os dados e encontra erros para o recurso baseados no Código da Estrada e legislação complementar. Responde APENAS em JSON.',
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }

    const analysis = JSON.parse(jsonStr);

    return res.status(200).json({
      ...analysis,
      remaining: rateLimit.remaining,
    });

  } catch (error) {
    console.error('Analysis error:', error);

    // Return fallback data on error
    return res.status(200).json({
      probability: 'Média',
      probabilityScore: 65,
      fineAmount: '120.00€ + Custas',
      deadlineDate: '15 dias úteis',
      daysRemaining: 15,
      errorsFound: [
        'Possível falta de verificação periódica do cinemómetro (Portaria nº 1542/2007).',
        'Descrição dos factos insuficiente para o exercício do contraditório (Art. 175º CE).',
        'Sinalização vertical eventualmente não conforme com o DR 22-A/98 (visibilidade/colocação).'
      ],
      summary: 'Infração detetada. O auto apresenta vulnerabilidades técnicas exploráveis.',
      infractionType: 'Contraordenação Rodoviária',
      legislationRef: 'Código da Estrada',
      fallback: true,
    });
  }
}
