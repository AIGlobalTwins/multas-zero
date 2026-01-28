import React from 'react';
import { Download, Printer, ArrowLeft, CheckCircle } from 'lucide-react';

interface Props {
  appealText: string;
  onReset: () => void;
}

export const GeneratedAppeal: React.FC<Props> = ({ appealText, onReset }) => {
  
  const handleDownloadDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Defesa Multa</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + appealText.replace(/\n/g, "<br/>") + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'defesa_multa_zero.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="no-print flex justify-between items-center mb-6">
        <button onClick={onReset} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-2" />
          Voltar ao início
        </button>
        <div className="flex space-x-3">
           <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            <Printer size={20} className="mr-2" />
            Imprimir
          </button>
          <button 
            onClick={handleDownloadDoc}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-bold"
          >
            <Download size={20} className="mr-2" />
            Baixar Word (.doc)
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div className="bg-white shadow-2xl p-12 min-h-[29.7cm] text-justify font-serif leading-relaxed text-gray-900 print:shadow-none print:p-0">
        <div dangerouslySetInnerHTML={{ __html: appealText.replace(/\n/g, '<br/>') }} />
      </div>

      {/* Instructions Section - No Print */}
      <div className="no-print mt-12 bg-gray-900 text-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold mb-6">Próximos Passos Obrigatórios</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
            <p>Imprime o documento (ou abre o Word) e <strong>assina no final</strong> (assinatura igual ao CC).</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
            <p>Anexa cópia do teu Cartão de Cidadão (ou escreve "Autorizo a consulta..." se preferires não enviar cópia) e cópia da Carta de Condução.</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
            <p>Envia por <strong>Carta Registada com Aviso de Receção</strong> para a morada da ANSR indicada na notificação original (geralmente: Parque de Ciências e Tecnologia de Oeiras, Avenida de Casal de Cabanas, Urbanização de Cabanas Golf, Nº 1, Tagus Park, 2734-507 Barcarena).</p>
          </div>
           <div className="flex items-start mt-6 pt-6 border-t border-gray-700">
             <CheckCircle className="text-green-400 w-6 h-6 mr-3" />
            <p className="text-green-400 font-bold italic">
              Garantia Multas Zero: Se o recurso for indeferido e tiveres de pagar, devolvemos o valor que pagaste por esta app. (Marketing demo)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};