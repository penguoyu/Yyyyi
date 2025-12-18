
import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DesignForm } from './components/DesignForm';
import { DesignDisplay } from './components/DesignDisplay';
import { Button } from './components/Button';
import { DesignRequest, TattooStyle, BodyPart, GeneratedDesign, ViewMode } from './types';
import { refinePrompt, generateTattooImage } from './services/geminiService';
import { Wand2, AlertCircle, Info, Key, ExternalLink } from 'lucide-react';

// Use a type assertion for window.aistudio to avoid conflicts with existing global declarations
const getAIStudio = () => (window as any).aistudio;

const DEFAULT_REQUEST: DesignRequest = {
  prompt: '',
  style: TattooStyle.TRADITIONAL,
  bodyPart: BodyPart.ARM,
  complexity: '中等',
  color: '黑白灰階',
  viewMode: ViewMode.DESIGN,
};

const MAX_HISTORY_ITEMS = 5;

function App() {
  const [request, setRequest] = useState<DesignRequest>(DEFAULT_REQUEST);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<GeneratedDesign | null>(null);
  const [history, setHistory] = useState<GeneratedDesign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPromptError, setShowPromptError] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = getAIStudio();
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aistudio = getAIStudio();
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume the key selection was successful to mitigate race conditions
      setHasApiKey(true);
      setError(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!request.prompt.trim()) {
      setShowPromptError(true);
      return;
    }

    const aistudio = getAIStudio();
    if (aistudio) {
      const selected = await aistudio.hasSelectedApiKey();
      if (!selected) {
        await handleOpenKeySelector();
        return;
      }
    }

    setIsGenerating(true);
    setError(null);
    setShowPromptError(false);

    try {
      const refined = await refinePrompt(request);
      const imageUrl = await generateTattooImage(refined, request.referenceImage);

      const newDesign: GeneratedDesign = {
        id: crypto.randomUUID(),
        imageUrl,
        originalRequest: { ...request },
        refinedPrompt: refined,
        timestamp: Date.now(),
      };

      setCurrentDesign(newDesign);
      setHistory(prev => [newDesign, ...prev].slice(0, MAX_HISTORY_ITEMS)); 
    } catch (err: any) {
      // Handle key selection reset if requested entity not found
      if (err.message === "KeyResetRequired") {
        setError("⚠️ API Key 設定有誤。請點擊下方的「設定 API Key」按鈕重新選取。");
        setHasApiKey(false);
      } else {
        setError(`系統錯誤: ${err.message || "未知錯誤"}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [request]);

  const handleDownload = () => {
    if (!currentDesign) return;
    const link = document.createElement('a');
    link.href = currentDesign.imageUrl;
    link.download = `inkspire-${currentDesign.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectHistory = (design: GeneratedDesign) => {
    setCurrentDesign(design);
    setRequest(design.originalRequest);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-blue-50 via-white to-white text-slate-900">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {!hasApiKey && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Key className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="text-amber-900 font-bold">啟用 Pro 生成模式</h3>
                <p className="text-amber-800/80 text-sm">請選取具有結帳權限的 API Key 以進行高品質與參考圖生成。</p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-amber-600 underline flex items-center gap-1 mt-1">
                   查看計費說明 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <button onClick={handleOpenKeySelector} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md transition-all">
              設定 API Key
            </button>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-sm text-red-800/80 leading-relaxed font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white shadow-xl">
              <DesignForm 
                values={request} 
                onChange={setRequest} 
                onSubmit={handleGenerate}
                isGenerating={isGenerating}
              />
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  className="w-full text-lg h-14 shadow-xl"
                  icon={<Wand2 className="w-5 h-5" />}
                >
                  {isGenerating ? '正在融合參考圖生成中...' : '生成 AI 刺青設計'}
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
             <div className="sticky top-28">
               <DesignDisplay 
                 design={currentDesign}
                 isGenerating={isGenerating}
                 onDownload={handleDownload}
                 history={history}
                 onSelectHistory={handleSelectHistory}
               />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
