import React, { useState } from 'react';
import { Upload, Camera, AlertTriangle } from 'lucide-react';

interface Props {
  onImageSelected: (base64: string) => void;
}

export const UploadSection: React.FC<Props> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove header data:image/jpeg;base64, for API if needed, 
        // but the Service handles standard base64 string usually. 
        // The SDK expects just the base64 data usually, let's clean it in the service or pass raw here.
        // Actually the Example shows passing full string to a helper usually, but for inlineData it needs raw base64.
        // Let's strip the prefix here to be safe.
        const base64Clean = result.split(',')[1];
        onImageSelected(base64Clean);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor carrega uma imagem (JPG, PNG). PDFs devem ser convertidos para imagem primeiro.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrega a Notificação</h2>
          <p className="text-gray-500">Tira uma foto clara ou carrega o ficheiro da multa.</p>
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Camera className="text-gray-400 mb-4" size={48} />
            <span className="text-lg font-semibold text-gray-700">Arrasta ou clica para carregar</span>
            <span className="text-sm text-gray-400 mt-2">Suporta JPG, PNG</span>
          </label>
        </div>

        <div className="mt-6 flex items-start bg-yellow-50 p-4 rounded-lg">
          <AlertTriangle className="text-yellow-600 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Certifica-te que o texto do auto (Nº do Auto, Data, Matrícula) está bem visível e focado.
          </p>
        </div>
      </div>
    </div>
  );
};