import React from 'react';
import { BodyPart, DesignRequest, ViewMode } from '../types';
import { STYLES, STYLE_DESCRIPTIONS, BODY_PARTS, RANDOM_PROMPTS } from '../constants';
import { Palette, Layers, User, Sparkles, FileImage, ScanFace } from 'lucide-react';

interface DesignFormProps {
  values: DesignRequest;
  onChange: (values: DesignRequest) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const DesignForm: React.FC<DesignFormProps> = ({ values, onChange, onSubmit, isGenerating }) => {
  
  const handleChange = <K extends keyof DesignRequest>(key: K, value: DesignRequest[K]) => {
    onChange({ ...values, [key]: value });
  };

  const handleRandomPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    const random = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    handleChange('prompt', random);
  };

  return (
    <div className="space-y-8">
      
      {/* View Mode Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-blue-900 uppercase tracking-widest">
          呈現方式 View Mode
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleChange('viewMode', ViewMode.DESIGN)}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              values.viewMode === ViewMode.DESIGN
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 transform scale-[1.02]'
                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            <FileImage className="w-5 h-5" />
            <span className="font-bold">純圖稿 Flash</span>
          </button>
          <button
            onClick={() => handleChange('viewMode', ViewMode.PREVIEW)}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              values.viewMode === ViewMode.PREVIEW
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 transform scale-[1.02]'
                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            <ScanFace className="w-5 h-5" />
            <span className="font-bold">實穿模擬 Skin</span>
          </button>
        </div>
      </div>

      {/* Prompt Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label className="block text-xs font-bold text-blue-900 uppercase tracking-widest">
            設計構想 Concept
          </label>
          <button
            onClick={handleRandomPrompt}
            className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200"
            disabled={isGenerating}
          >
            <Sparkles className="w-3.5 h-3.5" />
            隨機靈感
          </button>
        </div>
        <textarea
          className="w-full h-32 bg-white border-2 border-slate-100 rounded-xl p-4 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none placeholder-slate-400 text-base"
          placeholder="描述您想要的刺青圖案... 例如：幾何風格的雄鹿，鹿角變成樹枝，帶有極簡線條..."
          value={values.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <div className="text-xs text-slate-400 text-right">按住 Ctrl + Enter 快速生成</div>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
          <Palette className="w-4 h-4 text-blue-500" /> 藝術風格 Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {STYLES.map((style) => (
            <button
              key={style}
              onClick={() => handleChange('style', style)}
              className={`
                flex flex-col items-start p-3.5 rounded-xl border-2 transition-all text-left group
                ${values.style === style 
                  ? 'bg-blue-50 border-blue-600 ring-0' 
                  : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-slate-50'}
              `}
            >
              <span className={`font-bold text-sm ${values.style === style ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>
                {style}
              </span>
              <span className={`text-xs mt-1 line-clamp-1 ${values.style === style ? 'text-blue-600/80' : 'text-slate-400'}`}>
                {STYLE_DESCRIPTIONS[style]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Body Part */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
            <User className="w-4 h-4 text-blue-500" /> 身體部位 Placement
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-white border-2 border-slate-100 rounded-xl p-3 pl-4 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              value={values.bodyPart}
              onChange={(e) => handleChange('bodyPart', e.target.value as BodyPart)}
            >
              {BODY_PARTS.map(part => (
                <option key={part} value={part}>{part}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Color Mode */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
            <Layers className="w-4 h-4 text-blue-500" /> 色彩模式 Color
          </label>
          <div className="flex rounded-xl bg-slate-100/80 p-1.5 border border-slate-200">
            {(['黑白灰階', '彩色'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleChange('color', mode)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  values.color === mode
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};