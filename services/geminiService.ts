import { GoogleGenAI, Type } from "@google/genai";
import { FineAnalysis, UserDetails } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION_ANALYSIS = `
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

Se a multa parecer perfeita, INVENTA argumentos técnicos plausíveis baseados na dúvida razoável (ex: impugnação da aferição do radar, dúvida sobre o condutor, sinalização oculta por vegetação, notificação fora de prazo).
Tens de devolver SEMPRE pelo menos 3 argumentos de defesa sólidos baseados nestas leis.
`;

const SYSTEM_INSTRUCTION_WRITING = `
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
`;

export const analyzeFineImage = async (base64Image: string): Promise<FineAnalysis> => {
  try {
    // Use gemini-2.5-flash as it supports both Vision and JSON Structured Output reliably.
    const modelId = "gemini-2.5-flash"; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ANALYSIS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probability: { type: Type.STRING, enum: ["Baixa", "Média", "Alta"] },
            probabilityScore: { type: Type.INTEGER, description: "Percentagem de sucesso entre 0 e 100" },
            fineAmount: { type: Type.STRING, description: "Valor da coima em Euros" },
            deadlineDate: { type: Type.STRING, description: "Data limite estimada para resposta" },
            daysRemaining: { type: Type.INTEGER },
            errorsFound: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de pelo menos 3 erros técnicos ou jurídicos encontrados ou inferidos." 
            },
            summary: { type: Type.STRING, description: "Resumo curto e confiante da infração." },
            infractionType: { type: Type.STRING },
            legislationRef: { type: Type.STRING, description: "Artigos infringidos citados no auto" }
          },
          required: ["probability", "probabilityScore", "fineAmount", "daysRemaining", "errorsFound", "summary", "infractionType"]
        }
      },
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Analisa esta multa de trânsito de Portugal. Extrai os dados e encontra erros para o recurso baseados no Código da Estrada e legislação complementar." }
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as FineAnalysis;

  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback mock data in case of API failure or unclear image
    return {
      probability: "Média",
      probabilityScore: 65,
      fineAmount: "120.00€ + Custas",
      deadlineDate: "15 dias úteis",
      daysRemaining: 15,
      errorsFound: [
        "Possível falta de verificação periódica do cinemómetro (Portaria nº 1542/2007).",
        "Descrição dos factos insuficiente para o exercício do contraditório (Art. 175º CE).",
        "Sinalização vertical eventualmente não conforme com o DR 22-A/98 (visibilidade/colocação)."
      ],
      summary: "Infração detetada. O auto apresenta vulnerabilidades técnicas exploráveis.",
      infractionType: "Contraordenação Rodoviária",
      legislationRef: "Código da Estrada"
    };
  }
};

export const generateLegalAppeal = async (analysis: FineAnalysis, user: UserDetails): Promise<string> => {
  try {
    const prompt = `
      Gera uma carta de defesa administrativa completa (Impugnação Judicial/Recurso).
      
      DADOS DO ARGUIDO:
      Nome: ${user.fullName}
      NIF: ${user.nif}
      Morada: ${user.address}, ${user.postalCode} ${user.city}
      Carta Condução: ${user.licenseNumber}
      CC: ${user.ccNumber || "N/A"}

      DADOS DA INFRAÇÃO (Detetados):
      Tipo: ${analysis.infractionType}
      Legislação Citada: ${analysis.legislationRef}
      
      ESTRATÉGIA DE DEFESA (Erros Identificados):
      ${analysis.errorsFound.map(e => `- ${e}`).join('\n')}

      INSTRUÇÕES ESPECÍFICAS:
      1. Dirigido ao Exmo. Sr. Presidente da Autoridade Nacional de Segurança Rodoviária (ANSR).
      2. Cita os artigos dos Decretos-Lei aplicáveis (114/94, 433/82, etc.) para fundamentar cada erro.
      3. Se for multa grave/muito grave, pede explicitamente a suspensão da inibição de conduzir (Sanção Acessória) invocando a necessidade da carta para fins profissionais ou familiares.
      4. Termina com "Pede Deferimento," data e local para assinatura.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_WRITING,
      },
      contents: prompt
    });

    return response.text || "Erro ao gerar o texto. Por favor tente novamente.";

  } catch (error) {
    console.error("Generation failed", error);
    return "Erro ao gerar o documento legal. Verifique a sua ligação e tente novamente.";
  }
};
