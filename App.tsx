import React, { useState, useEffect } from 'react';
import { AppStep, FineAnalysis, UserDetails, FineHistoryItem } from './types';
import { analyzeFineImage, generateLegalAppeal } from './services/geminiService';
import { isAnalysisUnlocked, handlePaymentSuccess } from './services/paymentService';
import { UploadSection } from './components/UploadSection';
import { AnalysisResult } from './components/AnalysisResult';
import { UserForm } from './components/UserForm';
import { GeneratedAppeal } from './components/GeneratedAppeal';
import { HistoryView } from './components/HistoryView';
import { ShieldCheck, Loader2, History as HistoryIcon, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [analysisData, setAnalysisData] = useState<FineAnalysis | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [appealText, setAppealText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<FineHistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  // Check for payment success on mount (after Stripe redirect)
  useEffect(() => {
    const checkPaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      const analysisId = urlParams.get('analysis_id');

      if (success === 'true' && sessionId && analysisId) {
        // Verify and process payment
        const paid = await handlePaymentSuccess(sessionId, analysisId);
        if (paid) {
          setPaymentSuccess(true);
          setUnlockedIds(prev => new Set([...prev, analysisId]));
          setCurrentHistoryId(analysisId);

          // Load the analysis from history
          const savedHistory = localStorage.getItem('multasZeroHistory');
          if (savedHistory) {
            const historyItems: FineHistoryItem[] = JSON.parse(savedHistory);
            const item = historyItems.find(h => h.id === analysisId);
            if (item) {
              setAnalysisData(item.analysis);
              setCurrentStep(AppStep.RESULT);
            }
          }

          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);

          // Hide success message after 5 seconds
          setTimeout(() => setPaymentSuccess(false), 5000);
        }
      }
    };

    checkPaymentReturn();
  }, []);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('multasZeroHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Load unlocked IDs from localStorage
    const storedUnlocked = localStorage.getItem('multasZeroUnlocked');
    if (storedUnlocked) {
      try {
        const unlocked = JSON.parse(storedUnlocked);
        setUnlockedIds(new Set(Object.keys(unlocked)));
      } catch (e) {
        console.error("Failed to parse unlocked", e);
      }
    }
  }, []);

  // Save history helper
  const saveHistoryItem = (item: FineHistoryItem) => {
    setHistory(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      let newHistory;
      if (existingIndex >= 0) {
        newHistory = [...prev];
        newHistory[existingIndex] = item;
      } else {
        newHistory = [item, ...prev];
      }
      localStorage.setItem('multasZeroHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleImageSelected = async (base64: string) => {
    setCurrentStep(AppStep.ANALYZING);
    setError('');
    setAnalysisData(null);
    setAppealText('');
    setCurrentHistoryId(null);
    setUserDetails(null);

    try {
      const data = await analyzeFineImage(base64);
      setAnalysisData(data);
      
      // Create initial history entry
      const newId = crypto.randomUUID();
      setCurrentHistoryId(newId);
      
      const newItem: FineHistoryItem = {
        id: newId,
        timestamp: Date.now(),
        analysis: data,
        status: 'Aguardando Recurso'
      };
      saveHistoryItem(newItem);
      
      setCurrentStep(AppStep.RESULT);
    } catch (e) {
      console.error(e);
      setError('Não foi possível analisar a imagem. Tente novamente com uma foto mais clara.');
      setCurrentStep(AppStep.UPLOAD);
    }
  };

  const handleProceedToForm = () => {
    setCurrentStep(AppStep.DETAILS);
  };

  const handleDetailsSubmitted = async (details: UserDetails) => {
    setUserDetails(details);
    setCurrentStep(AppStep.GENERATING);
    if (analysisData) {
      const text = await generateLegalAppeal(analysisData, details);
      setAppealText(text);
      
      // Update history with generated appeal
      if (currentHistoryId) {
        const itemToUpdate = history.find(h => h.id === currentHistoryId);
        if (itemToUpdate) {
          const updatedItem: FineHistoryItem = {
            ...itemToUpdate,
            userDetails: details,
            appealText: text,
            status: 'Recurso Gerado'
          };
          saveHistoryItem(updatedItem);
        }
      }

      setCurrentStep(AppStep.RESULT); 
    }
  };

  const handleHistorySelect = (item: FineHistoryItem) => {
    setAnalysisData(item.analysis);
    setCurrentHistoryId(item.id);
    setError('');

    if (item.appealText && item.userDetails) {
      setUserDetails(item.userDetails);
      setAppealText(item.appealText);
      setCurrentStep(AppStep.RESULT);
    } else {
      setAppealText('');
      setUserDetails(null);
      setCurrentStep(AppStep.RESULT);
    }
  };

  const resetApp = () => {
    setCurrentStep(AppStep.UPLOAD);
    setAnalysisData(null);
    setAppealText('');
    setCurrentHistoryId(null);
    setUserDetails(null);
  };

  const renderContent = () => {
    switch (currentStep) {
      case AppStep.UPLOAD:
        return (
          <>
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Multas Zero<span className="text-blue-600">.</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                O assistente que anula multas de trânsito em Portugal. 
                <br/>
                <span className="font-bold text-gray-900">73% das multas têm erros.</span> Nós encontramo-los.
              </p>
            </div>
            <UploadSection onImageSelected={handleImageSelected} />
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center max-w-xl mx-auto">
                {error}
              </div>
            )}
          </>
        );

      case AppStep.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">A analisar contraordenação...</h2>
            <p className="text-gray-500">A verificar artigos do Código da Estrada, datas de calibração e prazos legais.</p>
          </div>
        );

      case AppStep.RESULT:
        // Check if we have the final text or just analysis
        if (appealText) {
          return <GeneratedAppeal appealText={appealText} onReset={resetApp} />;
        }
        if (analysisData && currentHistoryId) {
          const isUnlocked = unlockedIds.has(currentHistoryId) || isAnalysisUnlocked(currentHistoryId);
          return (
            <AnalysisResult
              analysis={analysisData}
              analysisId={currentHistoryId}
              isUnlocked={isUnlocked}
              onProceed={handleProceedToForm}
            />
          );
        }
        return null;

      case AppStep.DETAILS:
        return <UserForm onSubmit={handleDetailsSubmitted} />;

      case AppStep.GENERATING:
        return (
           <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
            <ShieldCheck className="w-16 h-16 text-green-600 mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">A redigir a defesa jurídica...</h2>
            <p className="text-gray-500">A citar jurisprudência e a formatar o documento para a ANSR.</p>
          </div>
        );
      
      case AppStep.HISTORY:
        return (
          <HistoryView 
            history={history} 
            onSelect={handleHistorySelect} 
            onBack={resetApp} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
       {/* Payment Success Banner */}
       {paymentSuccess && (
         <div className="fixed top-0 left-0 right-0 bg-green-500 text-white py-3 px-4 text-center z-50 animate-fade-in">
           <div className="flex items-center justify-center">
             <CheckCircle className="mr-2" size={20} />
             <span className="font-semibold">Pagamento confirmado! O conteúdo foi desbloqueado.</span>
           </div>
         </div>
       )}

       {/* Header / Nav */}
       <nav className={`w-full p-6 flex justify-between items-center no-print z-10 ${paymentSuccess ? 'mt-12' : ''}`}>
          <div 
            className="flex items-center space-x-2 font-black text-xl text-gray-900 cursor-pointer"
            onClick={resetApp}
          >
            <ShieldCheck className="text-blue-600" />
            <span>MULTAS ZERO</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentStep(AppStep.HISTORY)}
              className={`flex items-center font-medium transition-colors ${currentStep === AppStep.HISTORY ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <HistoryIcon size={18} className="mr-2" />
              Histórico
            </button>
          </div>
       </nav>

       {/* Background Accents */}
       <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"></div>

       {/* Main Content */}
       <main className="flex-grow container mx-auto px-4 py-8">
         {renderContent()}
       </main>

       {/* Footer */}
       <footer className="py-6 text-center text-gray-400 text-sm no-print">
         <p>© 2025 Multas Zero. Este serviço não dispensa a consulta de um advogado oficial.</p>
       </footer>
    </div>
  );
}