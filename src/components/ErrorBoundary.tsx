/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ErrorBoundary — auto-recovers after 3s, "Try Again" reloads page,
 * "Go Home" resets to home. Never leaves user stuck on error screen.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  countdown: number;
}

class ErrorBoundary extends Component<Props, State> {
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  public state: State = {
    hasError:  false,
    error:     null,
    countdown: 5,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, countdown: 5 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message);

    // Auto-redirect countdown
    this.countdownInterval = setInterval(() => {
      this.setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(this.countdownInterval!);
          window.location.hash = '#home';
          window.location.reload();
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  public componentWillUnmount() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  private handleTryAgain = () => {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    // Full reload is the only safe "try again" — re-render alone will crash again
    window.location.reload();
  };

  private handleGoHome = () => {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    window.location.hash = '#home';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">

            {/* Icon */}
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-display font-black text-white">
                Something went wrong
              </h2>
              <p className="text-slate-400 text-sm font-mono leading-relaxed">
                A render error occurred. Redirecting to home in{' '}
                <span className="text-orange-400 font-bold">{this.state.countdown}s</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleTryAgain}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-black text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-mono font-black text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Go Home
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
