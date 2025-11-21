import React from 'react';
import { TattooStyle, BodyPart, DesignRequest, ViewMode } from '../types';
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gold-500 uppercase tracking-wider">
          呈現方式
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleChange('viewMode', ViewMode.DESIGN)}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
              values.viewMode === ViewMode.DESIGN
                ? 'bg-gold-500 text-ink-950 border-gold-500 font-bold'
                : 'bg-ink-900 border-ink-700 text-ink-400 hover:border-ink-500'
            }`}
          >
            <FileImage className="w-4 h-4" />
            純圖稿 (Flash)
          </button>
          <button
            onClick={() => handleChange('viewMode', ViewMode.PREVIEW)}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
              values.viewMode === ViewMode.PREVIEW
                ? 'bg-gold-500 text-ink-950 border-gold-500 font-bold'
                : 'bg-ink-900 border-ink-700 text-ink-400 hover:border-ink-500'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            實穿模擬 (Skin)
          </button>
        </div>
      </div>

      {/* Prompt Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="block text-sm font-medium text-gold-500 uppercase tracking-wider">
            描述您的刺青構想
          </label>
          <button
            onClick={handleRandomPrompt}
            className="text-xs flex items-center gap-1 text-ink-400 hover:text-gold-500 transition-colors"
            disabled={isGenerating}
          >
            <Sparkles className="w-3 h-3" />
            幫我想個靈感
          </button>
        </div>
        <textarea
          className="w-full h-32 bg-ink-900 border border-ink-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all resize-none placeholder-ink-500"
          placeholder="例如：一隻兇猛的狼對著月亮嚎叫，周圍環繞著松樹和幾何形狀，想要有一點神祕感..."
          value={values.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gold-500 uppercase tracking-wider">
          <Palette className="w-4 h-4" /> 藝術風格
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {STYLES.map((style) => (
            <button
              key={style}
              onClick={() => handleChange('style', style)}
              className={`
                flex flex-col items-start p-3 rounded-lg border transition-all text-left
                ${values.style === style 
                  ? 'bg-ink-800 border-gold-500 ring-1 ring-gold-500' 
                  : 'bg-ink-900/50 border-ink-800 hover:border-ink-600 text-ink-400'}
              `}
            >
              <span className={`font-medium ${values.style === style ? 'text-white' : 'text-ink-300'}`}>
                {style}
              </span>
              <span className="text-xs text-ink-500 mt-1 line-clamp-1">
                {STYLE_DESCRIPTIONS[style]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Body Part */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gold-500 uppercase tracking-wider">
            <User className="w-4 h-4" /> 身體部位
          </label>
          <select
            className="w-full bg-ink-900 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
            value={values.bodyPart}
            onChange={(e) => handleChange('bodyPart', e.target.value as BodyPart)}
          >
            {BODY_PARTS.map(part => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>

        {/* Color Mode */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gold-500 uppercase tracking-wider">
            <Layers className="w-4 h-4" /> 色彩模式
          </label>
          <div className="flex rounded-lg bg-ink-900 p-1 border border-ink-700">
            {(['黑白灰階', '彩色'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleChange('color', mode)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  values.color === mode
                    ? 'bg-ink-700 text-white shadow-sm'
                    : 'text-ink-400 hover:text-white'
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