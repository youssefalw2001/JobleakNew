/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, Radio, Layers, DollarSign, Activity, Lock, ScanLine } from 'lucide-react';

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
      : 'text-slate-600 hover:text-slate-900 hover:border-b-2 hover:border-slate-300 transition-all';
  };

  const getMobileActiveClasses = (route: string) => {
    const isActive = currentRoute === route || (currentRoute === '' && route === '#home');
    return isActive 
      ? 'bg-blue-600 text-white font-medium pl-4 py-2 rounded-md' 
      : 'text-slate-705 text-slate-700 hover:bg-slate-100 hover:text-slate-950 pl-4 py-2 rounded-md transition-all';
  };

  return (
    <nav id="app-nav-container" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center">
            <button 
              id="brand-logo-trigger"
              onClick={() => handleNavClick('#home')} 
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white overflow-hidden shadow-inner font-display font-black text-xl">
                J
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-orange-500 border border-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-slate-900 flex items-center">
                Job<span className="text-blue-650 text-blue-600 font-extrabold">Leak</span>
                <span className="text-xs font-mono font-normal ml-2 bg-slate-100 text-blue-600 border border-slate-200/80 px-1.5 py-0.5 rounded tracking-wide uppercase">
                  v2.8
                </span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation Linkages */}
          <div className="hidden md:flex space-x-6 h-full items-stretch">
            {navItems.map((item) => (
              <button
                key={item.route}
                id={`nav-link-${item.route.replace('#', '')}`}
                onClick={() => handleNavClick(item.route)}
                className={`flex items-center px-1 pt-1 text-sm ${getActiveClasses(item.route)}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right action banner with Scan Form shortcut */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              id="cta-quick-scan-nav"
              onClick={() => handleNavClick('#scan')}
              className="px-4 py-2 text-xs font-display font-semibold uppercase tracking-wider text-white bg-blue-600 rounded hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
            >
              Analyze Your Market
            </button>
          </div>

          {/* Hamburger trigger for adaptive mobile testing viewports */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-drawer-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
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
        <div id="mobile-nav-panel" className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 flex flex-col">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.route}
                  id={`nav-link-mobile-${item.route.replace('#', '')}`}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center space-x-3 text-base ${getMobileActiveClasses(item.route)}`}
                >
                  <IconComp className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-3 border-t border-slate-200 px-3">
              <button
                id="cta-quick-scan-nav-mobile"
                onClick={() => handleNavClick('#scan')}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white bg-blue-600 rounded hover:bg-blue-700 transition-all shadow-sm"
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
