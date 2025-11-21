import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear local storage which is the likely culprit of data mismatch crashes
    localStorage.removeItem('inkspire_history');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 font-sans text-ink-100">
          <div className="max-w-md w-full bg-ink-900 border border-ink-800 rounded-xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">發生了一些問題</h2>
            <p className="text-ink-400 mb-6 text-sm leading-relaxed">
              應用程式遇到無法處理的錯誤（通常是舊的歷史紀錄資料格式不相容導致）。
              <br />請點擊下方按鈕重設應用程式。
            </p>
            
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-ink-950 font-bold rounded-lg transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              重設並修復
            </button>
            
            <div className="mt-6 p-3 bg-black/30 rounded text-xs text-ink-600 font-mono text-left overflow-hidden">
               Error: {this.state.error?.message}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}