import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Tu és um advogado de trânsito de elite em Portugal.
Escreve uma "Defesa Escrita" ou "Impugnação Judicial" formal para a ANSR.

A tua escrita deve ser jurídica, técnica e citar explicitamente a legislação:
- Cita o Código da Estrada (DL 114/94) ao discutir a infração.
- Usa o Regime Geral das Contraordenações (DL 433/82) para arguir nulidades ou prescrições.
- Invoca o Regulamento de Sinalização (DR 22-A/98) se houver causa provável.
- Menciona a Margem de Erro Admissível se for excesso de velocidade.

Estrutura Obrigatória:
1. Cabeçalho (Dirigido ao Presidente da ANSR).
2. Identificação do Arguido (Nome, CC, Carta, Morada).
3. Questão Prévia (se aplicável, ex: Prescrição ou Ilegitimidade).
4. Dos Factos (Narrativa que favorece o arguido ou nega a prática sem prova cabal).
5. Do Direito (Argumentação jurídica densa citando artigos e acórdãos fictícios mas plausíveis).
6. Do Pedido (Arquivamento do auto, ou subsidiariamente a suspensão da sanção acessória de inibição de conduzir).
7. Prova (Requerer junção de prova fotográfica, certificados de aferição e cadastro do condutor).

O tom deve ser respeitoso mas firme, tecnicamente complexo para desencorajar a análise rápida.
Formata o texto para ser um documento oficial pronto a imprimir.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysis, user } = req.body;

    if (!analysis || !user) {
      return res.status(400).json({ error: 'Analysis and user data are required' });
    }

    const prompt = `
Gera uma carta de defesa administrativa completa (Impugnação Judicial/Recurso).

DADOS DO ARGUIDO:
Nome: ${user.fullName}
NIF: ${user.nif}
Morada: ${user.address}, ${user.postalCode} ${user.city}
Carta Condução: ${user.licenseNumber}
CC: ${user.ccNumber || 'N/A'}

DADOS DA INFRAÇÃO (Detetados):
Tipo: ${analysis.infractionType}
Legislação Citada: ${analysis.legislationRef}

ESTRATÉGIA DE DEFESA (Erros Identificados):
${analysis.errorsFound.map((e: string) => `- ${e}`).join('\n')}

INSTRUÇÕES ESPECÍFICAS:
1. Dirigido ao Exmo. Sr. Presidente da Autoridade Nacional de Segurança Rodoviária (ANSR).
2. Cita os artigos dos Decretos-Lei aplicáveis (114/94, 433/82, etc.) para fundamentar cada erro.
3. Se for multa grave/muito grave, pede explicitamente a suspensão da inibição de conduzir (Sanção Acessória) invocando a necessidade da carta para fins profissionais ou familiares.
4. Termina com "Pede Deferimento," data e local para assinatura.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    return res.status(200).json({ appealText: content });

  } catch (error) {
    console.error('Generate appeal error:', error);
    return res.status(500).json({
      error: 'Erro ao gerar o documento legal. Verifique a sua ligação e tente novamente.'
    });
  }
}
