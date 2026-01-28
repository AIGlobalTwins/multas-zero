import React, { useState } from 'react';
import { Lock, CheckCircle, Shield, CreditCard, FileText, BookOpen, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '../services/paymentService';

interface Props {
  analysisId: string;
  onError?: (error: string) => void;
}

export const Paywall: React.FC<Props> = ({ analysisId, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      await createCheckoutSession(analysisId);
      // Will redirect to Stripe, so loading stays on
    } catch (error) {
      setIsLoading(false);
      onError?.('Erro ao processar pagamento. Tenta novamente.');
    }
  };

  const features = [
    { icon: FileText, text: 'Carta de defesa completa e personalizada' },
    { icon: BookOpen, text: 'Guia passo-a-passo para enviar o recurso' },
    { icon: CheckCircle, text: 'Erros técnicos e jurídicos detalhados' },
    { icon: Shield, text: 'Citação de legislação portuguesa aplicável' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
          <Lock size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Desbloqueia a Tua Defesa
        </h3>
        <p className="text-gray-600">
          Acede ao conteúdo completo e maximiza as tuas hipóteses de sucesso
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center bg-white rounded-lg p-3 shadow-sm">
            <feature.icon className="text-blue-600 w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-gray-700 font-medium">{feature.text}</span>
          </div>
        ))}
      </div>

      {/* Price and CTA */}
      <div className="text-center">
        <div className="mb-4">
          <span className="text-gray-500 text-sm line-through">9,99 €</span>
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-black text-gray-900">2,45</span>
            <span className="text-2xl font-bold text-gray-900 ml-1">€</span>
          </div>
          <span className="text-green-600 font-semibold text-sm">Poupas 75% - Oferta limitada</span>
        </div>

        <button
          onClick={handleUnlock}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:transform-none flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={24} />
              A processar...
            </>
          ) : (
            <>
              <CreditCard className="mr-2" size={24} />
              Desbloquear Agora
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center space-x-4 mt-6 text-gray-400 text-sm">
          <div className="flex items-center">
            <Shield size={16} className="mr-1" />
            <span>SSL Seguro</span>
          </div>
          <div className="flex items-center">
            <CreditCard size={16} className="mr-1" />
            <span>Powered by Stripe</span>
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-4">
          Pagamento único. Sem subscrições. Acesso imediato.
        </p>
      </div>
    </div>
  );
};
