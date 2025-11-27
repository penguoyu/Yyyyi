import React from 'react';
import { PenTool } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-blue-100 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/30 ring-2 ring-blue-100">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-serif font-bold tracking-wider text-slate-800">
            INK<span className="text-blue-600">SPIRE</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
           <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium tracking-wide">設計 Design</a>
           <a href="#gallery" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium tracking-wide">藝廊 Gallery</a>
           <a href="#about" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium tracking-wide">關於 About</a>
        </nav>
      </div>
    </header>
  );
};