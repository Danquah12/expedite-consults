'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTabName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class VeritasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VeritasLens Component Caught Error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-slate-900/95 border border-rose-800/80 rounded-2xl text-center space-y-4 max-w-2xl mx-auto shadow-2xl animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {this.props.fallbackTabName || 'Module'} Encountered a Display Issue
            </h3>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'An unexpected rendering state occurred. Your data is safe.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset & Reload View</span>
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/veritaslens';
                }
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
