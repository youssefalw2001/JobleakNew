/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Sparkles, Database } from 'lucide-react';

interface FooterProps {
  onRouteChange: (route: string) => void;
}

export default function Footer({ onRouteChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="bg-slate-100 border-t border-slate-700 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo Brand Statement */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-display font-medium text-sm">
                J
              </div>
              <span className="text-sm font-display font-bold text-slate-100 tracking-tight">
                Job<span className="text-blue-600 font-extrabold">Leak</span>
              </span>
            </div>
            
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              Algorithmic weather trigger diagnostics, regional permit heat maps, and live contractor opportunity forecasting on a unified professional command dashboard.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-slate-850 text-slate-100 font-semibold text-sm mb-4">Core Platform</h4>
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-wider text-slate-300">
              <li>
                <button onClick={() => { onRouteChange('#scan'); window.location.hash = '#scan'; }} className="hover:text-blue-600 transition-colors">
                  Risk Scanner
                </button>
              </li>
              <li>
                <button onClick={() => { onRouteChange('#radar'); window.location.hash = '#radar'; }} className="hover:text-blue-600 transition-colors">
                  Opportunity Radar
                </button>
              </li>
              <li>
                <button onClick={() => { onRouteChange('#campaign'); window.location.hash = '#campaign'; }} className="hover:text-blue-600 transition-colors">
                  Campaign Playbooks
                </button>
              </li>
              <li>
                <button onClick={() => { onRouteChange('#dashboard'); window.location.hash = '#dashboard'; }} className="hover:text-blue-600 transition-colors">
                  Active Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Trust Certifications */}
          <div>
            <h4 className="text-slate-850 text-slate-100 font-semibold text-sm mb-4">API Frameworks</h4>
            <ul className="space-y-2 font-sans">
              <li className="flex items-center space-x-2 text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Open-Meteo Geolocation (Core)</span>
              </li>
              <li className="flex items-center space-x-2 text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>NWS Weather Gov Alerts (Active)</span>
              </li>
              <li className="flex items-center space-x-2 text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Supabase lead_leads REST (Standby)</span>
              </li>
              <li className="flex items-center space-x-2 text-[11px] text-slate-200">
                <Shield className="h-3.5 w-3.5 text-blue-500" />
                <span>Enterprise Grade Encryption RLS</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Admin Trigger */}
          <div className="space-y-4">
            <h4 className="text-slate-850 text-slate-100 font-semibold text-sm mb-4">Network Status</h4>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-205 border-slate-700 shadow-sm space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
                <span>Signal Link:</span>
                <span className="text-emerald-600 flex items-center space-x-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-505 bg-emerald-500 animate-pulse mr-1" />
                  OPERATIONAL
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
                <span>Diagnostic Feed:</span>
                <span className="text-blue-600">SYNCED (UTC)</span>
              </div>
            </div>
            
            {/* Subtle Administrator Console Link */}
            <div className="pt-2 text-right">
              <button 
                id="footer-admin-link"
                onClick={() => { onRouteChange('#admin'); window.location.hash = '#admin'; }} 
                className="text-[9px] font-mono text-slate-400 hover:text-slate-300 underline transition-colors"
              >
                Access Admin Overlay Console
              </button>
            </div>
          </div>
        </div>

        {/* Outer legal constraints footer */}
        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-[11px] font-sans">
          <span>&copy; {currentYear} JobLeak Intelligence Technologies. All rights reserved.</span>
          <div className="flex space-x-4">
            <span className="text-slate-400">Confidential executive contractor platform. Data processed aligns with strict security parameters.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
