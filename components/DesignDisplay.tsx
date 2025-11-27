import React from 'react';
import { Download, Info, Clock } from 'lucide-react';
import { GeneratedDesign } from '../types';
import { Button } from './Button';

interface DesignDisplayProps {
  design: GeneratedDesign | null;
  isGenerating: boolean;
  onDownload: () => void;
  history: GeneratedDesign[];
  onSelectHistory: (design: GeneratedDesign) => void;
}

export const DesignDisplay: React.FC<DesignDisplayProps> = ({ 
  design, 
  isGenerating, 
  onDownload,
  history,
  onSelectHistory
}) => {
  
  // Main Content Rendering
  const renderMainContent = () => {
    if (!design && !isGenerating) {
      return (
        <div className="aspect-square flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-slate-700 mb-2">您的設計畫布</h3>
          <p className="text-slate-500 max-w-xs">
            在左側填寫設計細節，點擊生成以創建您的專屬刺青圖稿。
          </p>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="aspect-square flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-8 shadow-inner">
          <div className="relative w-24 h-24 mb-6">
             <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-serif text-slate-800 mb-2 animate-pulse">正在構建您的傑作...</h3>
          <p className="text-slate-500 text-sm">我們的 AI 藝術家正在繪製您的構想</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 animate-fadeIn">
        <div className="relative group rounded-xl overflow-hidden bg-white shadow-2xl shadow-slate-200 border border-slate-100">
          {/* Image Container */}
          <div className="aspect-square w-full relative">
              <img 
                src={design?.imageUrl} 
                alt="Generated Tattoo" 
                className="w-full h-full object-contain p-4 bg-white"
              />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
             <Button 
               variant="primary" 
               onClick={onDownload}
               icon={<Download className="w-5 h-5" />}
             >
               下載高畫質大圖
             </Button>
          </div>
        </div>

        {/* Design Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">AI 優化提示詞 (英文)</h4>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-help font-mono">
                {design?.refinedPrompt}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">註：AI 自動將您的中文需求轉換為英文提示詞以獲得最佳圖像效果。</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderMainContent()}

      {/* History Strip */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 text-slate-500">
             <Clock className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-wider">歷史紀錄</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className={`
                  relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all shadow-sm
                  ${design?.id === item.id ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2' : 'border-slate-200 hover:border-blue-400 opacity-80 hover:opacity-100'}
                `}
              >
                <img 
                  src={item.imageUrl} 
                  alt="History thumbnail" 
                  className="w-full h-full object-cover bg-white"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};