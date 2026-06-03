/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.hash = '#home';
    this.handleReset();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8 text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-display font-bold text-white">
                  Something Went Wrong
                </h1>
                <p className="text-slate-400 text-sm">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300">
                  <summary className="cursor-pointer text-red-400 font-bold mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-slate-400">Error:</strong>
                      <pre className="mt-1 text-red-300 whitespace-pre-wrap">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong className="text-slate-400">Component Stack:</strong>
                        <pre className="mt-1 text-slate-400 whitespace-pre-wrap max-h-40 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-display font-bold rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
              </div>

              {/* Support Info */}
              <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
                <p>
                  If this problem persists, please contact support with error ID:{' '}
                  <code className="text-slate-400 bg-slate-950 px-2 py-1 rounded font-mono">
                    {Date.now().toString(36).toUpperCase()}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
