import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DesignForm } from './components/DesignForm';
import { DesignDisplay } from './components/DesignDisplay';
import { Button } from './components/Button';
import { DesignRequest, TattooStyle, BodyPart, GeneratedDesign, ViewMode } from './types';
import { refinePrompt, generateTattooImage } from './services/geminiService';
import { Wand2, AlertCircle, Info } from 'lucide-react';

const DEFAULT_REQUEST: DesignRequest = {
  prompt: '',
  style: TattooStyle.TRADITIONAL,
  bodyPart: BodyPart.ARM,
  complexity: '中等',
  color: '黑白灰階',
  viewMode: ViewMode.DESIGN, // Default to Flash Sheet
};

function App() {
  const [request, setRequest] = useState<DesignRequest>(DEFAULT_REQUEST);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<GeneratedDesign | null>(null);
  const [history, setHistory] = useState<GeneratedDesign[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage on mount with error handling
  useEffect(() => {
    const savedHistory = localStorage.getItem('inkspire_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          const validHistory = parsed
            .filter((item: any) => item && item.id && item.imageUrl)
            .map((item: any) => ({
              ...item,
              originalRequest: {
                ...item.originalRequest,
                viewMode: item.originalRequest.viewMode || ViewMode.DESIGN
              }
            }));
            
          setHistory(validHistory);
          if (validHistory.length > 0) {
            setCurrentDesign(validHistory[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load history - data corrupted. Resetting.", e);
        localStorage.removeItem('inkspire_history');
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('inkspire_history', JSON.stringify(history));
    }
  }, [history]);

  const handleGenerate = useCallback(async () => {
    if (!request.prompt.trim()) {
      setError("請先描述您的刺青想法。");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const refined = await refinePrompt(request);
      const imageUrl = await generateTattooImage(refined);

      const newDesign: GeneratedDesign = {
        id: crypto.randomUUID(),
        imageUrl,
        originalRequest: { ...request },
        refinedPrompt: refined,
        timestamp: Date.now(),
      };

      setCurrentDesign(newDesign);
      setHistory(prev => [newDesign, ...prev]); 
    } catch (err: any) {
      console.error("Generation failed:", err);
      
      let displayError = "設計生成失敗，請稍後再試。";
      const errorString = (err.message || err.toString()).toLowerCase();

      if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('resource exhausted')) {
         displayError = "⚠️ 額度已達上限 (Quota Exceeded)\nGoogle API 每日生成次數有限。請稍作休息，或者明天再來嘗試！";
      } 
      else if (errorString.includes('safety') || errorString.includes('blocked') || errorString.includes('content')) {
         displayError = "⚠️ 內容被過濾 (Safety Filter)\n您的描述可能包含被 AI 視為敏感的詞彙。請嘗試修改描述，例如將「血腥」改為「紅色墨水」。";
      }
      else if (errorString.includes('permission') || errorString.includes('403') || errorString.includes('key')) {
         displayError = "🔒 權限不足 (Permission Denied)\n無法使用高階繪圖模型。這通常是因為 API Key 未啟用相關服務或未綁定 Billing。系統已嘗試切換至標準模型但仍失敗。\n請檢查您的 API Key 設定。";
      }
      else {
         displayError = `系統錯誤: ${err.message || "未知錯誤"}`;
      }

      setError(displayError);
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
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-blue-50 via-white to-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {error && (
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-blue-900 font-bold">生成時遇到狀況</h3>
              <p className="whitespace-pre-line text-sm text-blue-800/80 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white shadow-xl shadow-blue-100/50 ring-1 ring-blue-50">
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
                  className="w-full text-lg h-14 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all"
                  icon={<Wand2 className="w-5 h-5" />}
                >
                  {isGenerating ? 'AI 正在繪製中...' : '開始生成設計'}
                </Button>
                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>系統會自動選用最佳模型 (Pro/Flash)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Display */}
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

      <footer className="border-t border-blue-100 mt-auto bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">
            © 2024 InkSpire AI. Powered by Google Gemini 3.0 & Imagen.
          </p>
          <div className="flex gap-8 text-sm text-slate-400 font-medium">
             <a href="#" className="hover:text-blue-600 transition-colors">隱私權政策</a>
             <a href="#" className="hover:text-blue-600 transition-colors">使用條款</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;