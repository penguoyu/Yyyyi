import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DesignForm } from './components/DesignForm';
import { DesignDisplay } from './components/DesignDisplay';
import { Button } from './components/Button';
import { DesignRequest, TattooStyle, BodyPart, GeneratedDesign, ViewMode } from './types';
import { refinePrompt, generateTattooImage } from './services/geminiService';
import { Wand2, AlertTriangle } from 'lucide-react';

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
        // Validate that parsed is an array to prevent crashes
        if (Array.isArray(parsed)) {
          // Filter out potentially corrupted items (missing IDs or URLs)
          // Also backfill viewMode for old items
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
          
          // Set the latest design as current if available
          if (validHistory.length > 0) {
            setCurrentDesign(validHistory[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load history - data corrupted. Resetting.", e);
        // If data is corrupted, clear it to prevent future crashes
        localStorage.removeItem('inkspire_history');
        setHistory([]);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
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
      // Step 1: Refine the prompt using Gemini Flash
      const refined = await refinePrompt(request);
      
      // Step 2: Generate the image using Gemini 3 Pro Image (with fallback to Flash)
      const imageUrl = await generateTattooImage(refined);

      const newDesign: GeneratedDesign = {
        id: crypto.randomUUID(),
        imageUrl,
        originalRequest: { ...request },
        refinedPrompt: refined,
        timestamp: Date.now(),
      };

      setCurrentDesign(newDesign);
      setHistory(prev => [newDesign, ...prev]); // Add new design to front of history
    } catch (err: any) {
      console.error("Generation failed:", err);
      
      let displayError = "設計生成失敗，請稍後再試。";
      const errorString = (err.message || err.toString()).toLowerCase();

      // Handle Quota/Rate Limit Errors (429)
      if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('resource exhausted')) {
         displayError = "⚠️ 額度已達上限 (Quota Exceeded)\nGoogle 免費版 API 每日或每分鐘生成次數有限。\n請稍作休息，或者明天再來嘗試！";
      } 
      // Handle Safety Filters
      else if (errorString.includes('safety') || errorString.includes('blocked') || errorString.includes('content')) {
         displayError = "⚠️ 內容被過濾 (Safety Filter)\n您的描述可能包含過於暴力、血腥或敏感的詞彙，被 AI 安全機制攔截。\n請嘗試修改描述，例如將「血腥」改為「紅色墨水」。";
      }
      // Handle Network/Key errors
      else if (errorString.includes('key') || errorString.includes('unauthenticated') || errorString.includes('403')) {
         displayError = "⚠️ API Key 無效或權限不足\n1. 請確認 .env 檔案設定正確。\n2. 您使用的 Key 可能不支援 Gemini 3 Pro，請確認該專案已綁定 Billing (付費帳戶)。\n3. 系統已嘗試自動切換至標準模型，但仍失敗，請檢查 Key 是否有效。";
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
    setRequest(design.originalRequest); // Restore the form values used for that design
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-ink-950 text-ink-100 selection:bg-gold-500 selection:text-black">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 flex items-start gap-3 animate-fadeIn shadow-lg">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="whitespace-pre-line text-sm font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-ink-900/50 backdrop-blur-sm rounded-xl p-6 border border-ink-800 shadow-xl">
              <DesignForm 
                values={request} 
                onChange={setRequest} 
                onSubmit={handleGenerate}
                isGenerating={isGenerating}
              />
              
              <div className="mt-8 pt-6 border-t border-ink-800">
                <Button 
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  className="w-full text-lg h-14 shadow-gold-500/10"
                  icon={<Wand2 className="w-5 h-5" />}
                >
                  {isGenerating ? 'AI 正在繪製中...' : '開始生成設計'}
                </Button>
                <p className="text-center text-xs text-ink-500 mt-3">
                  消耗 1 點生成額度 • 優先使用 Gemini 3.0 Pro (自動調節)
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Display */}
          <div className="lg:col-span-7">
             <div className="sticky top-24">
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

      <footer className="border-t border-ink-800 mt-auto bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-ink-600 text-sm">
            © 2024 InkSpire AI. Powered by Google Gemini 3.0 Pro & Imagen.
          </p>
          <div className="flex gap-6 text-sm text-ink-600">
             <a href="#" className="hover:text-gold-500 transition-colors">隱私權政策</a>
             <a href="#" className="hover:text-gold-500 transition-colors">使用條款</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;