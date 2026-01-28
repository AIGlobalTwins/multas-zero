import { FineAnalysis, UserDetails } from "../types";

export const analyzeFineImage = async (base64Image: string): Promise<FineAnalysis> => {
  try {
    const response = await fetch('/api/analyze-fine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (response.status === 429) {
      const data = await response.json();
      throw new Error(data.error || 'Limite de uso atingido');
    }

    if (!response.ok) {
      throw new Error('Falha na análise');
    }

    const data = await response.json();
    return data as FineAnalysis;

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const generateLegalAppeal = async (analysis: FineAnalysis, user: UserDetails): Promise<string> => {
  try {
    const response = await fetch('/api/generate-appeal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysis, user }),
    });

    if (!response.ok) {
      throw new Error('Falha ao gerar defesa');
    }

    const data = await response.json();
    return data.appealText;

  } catch (error) {
    console.error("Generation failed", error);
    return "Erro ao gerar o documento legal. Verifique a sua ligação e tente novamente.";
  }
};
