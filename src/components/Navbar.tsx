/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Radio, Layers, DollarSign, Activity, Lock, ScanLine } from 'lucide-react';
import JobLeakLogo from './JobLeakLogo';

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

export default function Navbar({ currentRoute, onRouteChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Set up click handlers that update route state and collapse navigation drawer automatically
  const handleNavClick = (route: string) => {
    onRouteChange(route);
    setIsOpen(false);
    window.location.hash = route;
  };

  const navItems = [
    { label: 'Home', route: '#home', icon: Layers },
    { label: 'Risk Scan', route: '#scan', icon: ScanLine },
    { label: 'Opportunity Radar', route: '#radar', icon: Radio },
    { label: 'Campaign Engine', route: '#campaign', icon: Layers },
    { label: 'SaaS Pricing', route: '#pricing', icon: DollarSign },
    { label: 'Dashboard', route: '#dashboard', icon: Activity },
    { label: 'Login', route: '#login', icon: Lock },
  ];

  const getActiveClasses = (route: string) => {
    const isActive = currentRoute === route || (currentRoute === '' && route === '#home');
    return isActive 
      ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' 
      : 'text-slate-300 hover:text-white hover:border-b-2 hover:border-slate-600 transition-all';
  };

  const getMobileActiveClasses = (route: string) => {
    const isActive = currentRoute === route || (currentRoute === '' && route === '#home');
    return isActive 
      ? 'bg-blue-600 text-white font-medium pl-4 py-2 rounded-md' 
      : 'text-slate-705 text-slate-200 hover:bg-slate-100 hover:text-white pl-4 py-2 rounded-md transition-all';
  };

  return (
    <nav id="app-nav-container" className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
            <button
              id="brand-logo-trigger"
              onClick={() => handleNavClick('#home')}
              className="focus:outline-none rounded-xl"
            >
              <JobLeakLogo variant="full" size="md" />
            </button>

          {/* Desktop Navigation Linkages */}
          <div className="hidden md:flex space-x-1 h-full items-center">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route || (currentRoute === '' && item.route === '#home');
              return (
                <button
                  key={item.route}
                  id={`nav-link-${item.route.replace('#', '')}`}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center px-3 py-1.5 text-sm font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right action banner with Scan Form shortcut */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              id="cta-quick-scan-nav"
              onClick={() => handleNavClick('#scan')}
              className="px-4 py-2 text-sm font-display font-semibold uppercase tracking-wider text-white bg-blue-600 rounded hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              Analyze Your Market
            </button>
          </div>

          {/* Hamburger trigger for adaptive mobile testing viewports */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-drawer-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open Menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Adaptive Mobile Navigation Drawer */}
      {isOpen && (
        <div id="mobile-nav-panel" className="md:hidden bg-slate-950 border-b border-slate-800">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 flex flex-col">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.route}
                  id={`nav-link-mobile-${item.route.replace('#', '')}`}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center space-x-3 text-base ${
                    currentRoute === item.route || (currentRoute === '' && item.route === '#home')
                      ? 'bg-blue-600/10 text-blue-400 font-medium pl-4 py-2 rounded-md' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white pl-4 py-2 rounded-md transition-all'
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-3 border-t border-slate-800 px-3 mt-2">
              <button
                id="cta-quick-scan-nav-mobile"
                onClick={() => handleNavClick('#scan')}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white bg-blue-600 rounded hover:bg-blue-500 transition-all shadow-sm"
              >
                Perform Risk Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
