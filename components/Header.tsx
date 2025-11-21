import React from 'react';
import { PenTool } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-ink-800 bg-ink-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gold-500 rounded-md">
            <PenTool className="h-6 w-6 text-ink-950" />
          </div>
          <span className="text-2xl font-serif font-bold tracking-wider text-white">
            INK<span className="text-gold-500">SPIRE</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
           <a href="#" className="text-ink-100 hover:text-gold-500 transition-colors text-sm font-medium">開始設計</a>
           <a href="#gallery" className="text-ink-500 hover:text-gold-500 transition-colors text-sm font-medium">靈感藝廊</a>
           <a href="#about" className="text-ink-500 hover:text-gold-500 transition-colors text-sm font-medium">關於我們</a>
        </nav>
      </div>
    </header>
  );
};