
import React, { useRef } from 'react';
import { BodyPart, DesignRequest, ViewMode } from '../types';
import { STYLES, STYLE_DESCRIPTIONS, BODY_PARTS, RANDOM_PROMPTS } from '../constants';
import { Palette, Layers, User, Sparkles, FileImage, ScanFace, Upload, X } from 'lucide-react';

interface DesignFormProps {
  values: DesignRequest;
  onChange: (values: DesignRequest) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const DesignForm: React.FC<DesignFormProps> = ({ values, onChange, onSubmit, isGenerating }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = <K extends keyof DesignRequest>(key: K, value: DesignRequest[K]) => {
    onChange({ ...values, [key]: value });
  };

  const handleRandomPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    const random = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    handleChange('prompt', random);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('referenceImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReference = () => {
    handleChange('referenceImage', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Reference Image Upload */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-blue-900 uppercase tracking-widest">
          參考圖 Reference (選擇性)
        </label>
        {values.referenceImage ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg group">
            <img src={values.referenceImage} className="w-full h-full object-cover" alt="Reference" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={removeReference}
                 className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
          >
            <Upload className="w-6 h-6" />
            <span className="text-sm font-medium">上傳皮膚照片或草圖參考</span>
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

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
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
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
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
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
            className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors font-semibold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200"
            disabled={isGenerating}
          >
            <Sparkles className="w-3.5 h-3.5" />
            隨機靈感
          </button>
        </div>
        <textarea
          className="w-full h-24 bg-white border-2 border-slate-100 rounded-xl p-4 text-slate-900 focus:border-blue-500 transition-all resize-none text-base"
          placeholder="例如：在參考圖的手臂上加入一朵盛開的藍色玫瑰..."
          value={values.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-widest">
          <Palette className="w-4 h-4 text-blue-500" /> 藝術風格 Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
          {STYLES.map((style) => (
            <button
              key={style}
              onClick={() => handleChange('style', style)}
              className={`
                flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left
                ${values.style === style ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100 hover:border-blue-300'}
              `}
            >
              <span className="font-bold text-sm text-slate-700">{style}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-blue-900 uppercase">
            <User className="w-3 h-3" /> 部位
          </label>
          <select
            className="w-full bg-white border-2 border-slate-100 rounded-lg p-2 text-sm outline-none"
            value={values.bodyPart}
            onChange={(e) => handleChange('bodyPart', e.target.value as BodyPart)}
          >
            {BODY_PARTS.map(part => <option key={part} value={part}>{part}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-blue-900 uppercase">
            <Layers className="w-3 h-3" /> 色彩
          </label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['黑白灰階', '彩色'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleChange('color', mode)}
                className={`flex-1 py-1 text-[10px] font-bold rounded ${values.color === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
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
