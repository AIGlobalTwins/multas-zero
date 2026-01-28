import React from 'react';
import { FineHistoryItem } from '../types';
import { ArrowLeft, FileText, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface Props {
  history: FineHistoryItem[];
  onSelect: (item: FineHistoryItem) => void;
  onBack: () => void;
}

export const HistoryView: React.FC<Props> = ({ history, onSelect, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-gray-900">O Teu Histórico</h2>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sem multas registadas</h3>
          <p className="text-gray-500 mb-6">Ainda não analisaste nenhuma infração. Quando o fizeres, ficarão guardadas aqui.</p>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analisar Nova Multa
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                  ${item.analysis.probability === 'Alta' ? 'bg-green-100 text-green-600' : 
                    item.analysis.probability === 'Média' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}
                `}>
                  <span className="font-bold text-sm">{item.analysis.probabilityScore}%</span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {item.analysis.infractionType || 'Infração Desconhecida'}
                    </h4>
                    {item.status === 'Recurso Gerado' ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle size={10} className="mr-1" /> Gerado
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
                        <Clock size={10} className="mr-1" /> Pendente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {new Date(item.timestamp).toLocaleDateString('pt-PT')}
                    </span>
                    <span className="flex items-center">
                      <AlertTriangle size={14} className="mr-1" />
                      {item.analysis.errorsFound.length} erros
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center md:flex-col md:items-end space-x-4 md:space-x-0">
                <span className="text-lg font-bold text-gray-900">{item.analysis.fineAmount}</span>
                <div className="flex items-center text-blue-600 font-semibold text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalhes <FileText size={14} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};