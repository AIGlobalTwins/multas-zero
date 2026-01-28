export interface FineAnalysis {
  probability: 'Baixa' | 'Média' | 'Alta';
  probabilityScore: number; // 0-100
  fineAmount: string;
  deadlineDate: string;
  daysRemaining: number;
  errorsFound: string[];
  summary: string;
  infractionType: string;
  legislationRef: string;
}

export interface UserDetails {
  fullName: string;
  nif: string; // Número de Identificação Fiscal
  address: string;
  postalCode: string;
  city: string;
  licenseNumber: string; // Carta de Condução
  ccNumber?: string; // Cartão de Cidadão
}

export interface FineHistoryItem {
  id: string;
  timestamp: number;
  analysis: FineAnalysis;
  userDetails?: UserDetails;
  appealText?: string;
  status: 'Aguardando Recurso' | 'Recurso Gerado' | 'Pago';
}

export interface PaymentInfo {
  analysisId: string;
  sessionId: string;
  unlockedAt: number;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  DETAILS = 'DETAILS',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
}