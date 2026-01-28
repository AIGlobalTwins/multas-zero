import React from 'react';
import { FineAnalysis } from '../types';
import { CheckCircle2, AlertOctagon, Calendar, DollarSign, ShieldCheck, Lock } from 'lucide-react';
import { Paywall } from './Paywall';

interface Props {
  analysis: FineAnalysis;
  analysisId: string;
  isUnlocked: boolean;
  onProceed: () => void;
}

export const AnalysisResult: React.FC<Props> = ({ analysis, analysisId, isUnlocked, onProceed }) => {
  const isHighProb = analysis.probability === 'Alta';
  const isMedProb = analysis.probability === 'Média';

  const colorClass = isHighProb ? 'text-green-600' : isMedProb ? 'text-yellow-600' : 'text-red-600';
  const bgClass = isHighProb ? 'bg-green-100' : isMedProb ? 'bg-yellow-100' : 'bg-red-100';
  const borderClass = isHighProb ? 'border-green-500' : isMedProb ? 'border-yellow-500' : 'border-red-500';

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Hero Result - Always visible */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
        <div className={`p-6 ${bgClass} text-center border-b-4 ${borderClass}`}>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Probabilidade de Sucesso</h2>
          <div className="flex justify-center items-baseline space-x-2">
            <span className={`text-6xl font-black ${colorClass}`}>{analysis.probabilityScore}%</span>
            <span className={`text-2xl font-bold ${colorClass}`}>({analysis.probability})</span>
          </div>
          <p className="text-gray-700 mt-4 font-medium text-lg italic">
            "{isHighProb ? "Esta multa tem falhas claras que podemos explorar." : isMedProb ? "Encontrámos argumentos válidos para contestar." : "Será difícil, mas há margem para recurso."}"
          </p>
        </div>

        {/* Stats Grid - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
          <div className="p-6 flex flex-col items-center text-center">
            <DollarSign className="text-red-500 mb-2" size={28} />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Custo Estimado</span>
            <span className="text-xl font-bold text-gray-900">{analysis.fineAmount}</span>
          </div>
          <div className="p-6 flex flex-col items-center text-center">
            <Calendar className="text-orange-500 mb-2" size={28} />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Prazo Restante</span>
            <span className="text-xl font-bold text-gray-900">{analysis.daysRemaining} dias</span>
            <span className="text-xs text-gray-400">Data limite: {analysis.deadlineDate}</span>
          </div>
          <div className="p-6 flex flex-col items-center text-center">
            <ShieldCheck className="text-blue-500 mb-2" size={28} />
            <span className="text-sm text-gray-500 uppercase tracking-wider">Erros Detetados</span>
            <span className="text-xl font-bold text-gray-900">{analysis.errorsFound.length} falhas</span>
          </div>
        </div>

        {/* Summary - Always visible */}
        <div className="p-6 bg-blue-50 border-b">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Resumo da Análise</h3>
          <p className="text-gray-700">{analysis.summary}</p>
          {analysis.legislationRef && (
            <p className="text-sm text-gray-500 mt-2">
              <strong>Legislação:</strong> {analysis.legislationRef}
            </p>
          )}
        </div>

        {isUnlocked ? (
          <>
            {/* Detected Errors List - Only when unlocked */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <AlertOctagon className="mr-2 text-red-500" />
                Falhas Encontradas na Notificação
              </h3>
              <ul className="space-y-4">
                {analysis.errorsFound.map((error, idx) => (
                  <li key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{error}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-center">
               <button
                 onClick={onProceed}
                 className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
               >
                 Gerar Carta de Defesa
               </button>
            </div>
          </>
        ) : (
          <>
            {/* Blurred Preview - When locked */}
            <div className="p-8 relative">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <AlertOctagon className="mr-2 text-red-500" />
                Falhas Encontradas na Notificação
              </h3>

              {/* Blurred content preview */}
              <div className="relative">
                <ul className="space-y-4 filter blur-sm select-none pointer-events-none">
                  {analysis.errorsFound.slice(0, 2).map((_, idx) => (
                    <li key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor...
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                  <div className="flex items-center text-gray-500">
                    <Lock className="mr-2" size={20} />
                    <span className="font-medium">Conteúdo bloqueado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paywall */}
            <div className="p-6 border-t">
              <Paywall analysisId={analysisId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};