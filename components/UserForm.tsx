import React, { useState } from 'react';
import { UserDetails } from '../types';

interface Props {
  onSubmit: (details: UserDetails) => void;
}

export const UserForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserDetails>({
    fullName: '',
    nif: '',
    address: '',
    postalCode: '',
    city: '',
    licenseNumber: '',
    ccNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Dados para a Defesa</h2>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Precisamos destes dados apenas para preencher o cabeçalho formal da carta para a ANSR.
          Não guardamos os teus dados.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              required type="text" name="fullName" 
              value={formData.fullName} onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Como consta no CC"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
              <input 
                required type="text" name="nif" 
                value={formData.nif} onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="123456789"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Carta de Condução Nº</label>
              <input 
                required type="text" name="licenseNumber" 
                value={formData.licenseNumber} onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="P-1234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Morada Completa</label>
            <input 
              required type="text" name="address" 
              value={formData.address} onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Rua, Número, Andar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input 
                required type="text" name="postalCode" 
                value={formData.postalCode} onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0000-000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
              <input 
                required type="text" name="city" 
                value={formData.city} onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Lisboa"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-lg shadow-md transition-all mt-6 text-lg"
          >
            Gerar Documento Final
          </button>
        </form>
      </div>
    </div>
  );
};