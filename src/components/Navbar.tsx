/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Radio, Layers, DollarSign, Activity, Lock, ScanLine, LogOut, User } from 'lucide-react';
import JobLeakLogo from './JobLeakLogo';
import { getActiveSession, saveActiveSession } from '../authService';

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

export default function Navbar({ currentRoute, onRouteChange }: NavbarProps) {
  const [isOpen, setIsOpen]           = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [userName, setUserName]       = useState('');

  // Re-check session on every route change so Navbar is always in sync
  useEffect(() => {
    const session = getActiveSession();
    setIsLoggedIn(!!session);
    setUserName(session?.businessName || session?.email || '');
  }, [currentRoute]);

  const handleNavClick = (route: string) => {
    onRouteChange(route);
    setIsOpen(false);
    window.location.hash = route;
  };

  const handleLogout = () => {
    import('../firebase').then(({ auth }) => {
      auth.signOut().then(() => {
        saveActiveSession(null);
        setIsLoggedIn(false);
        handleNavClick('#home');
        window.location.reload();
      });
    }).catch(() => {
      saveActiveSession(null);
      setIsLoggedIn(false);
      handleNavClick('#home');
    });
    setIsOpen(false);
  };

  // Nav items — swap Login for Dashboard when logged in
  const navItems = [
    { label: 'Home',              route: '#home',      icon: Layers },
    { label: 'Risk Scan',         route: '#scan',      icon: ScanLine },
    { label: 'Radar',             route: '#radar',     icon: Radio },
    { label: 'Campaign',          route: '#campaign',  icon: Layers },
    { label: 'Pricing',           route: '#pricing',   icon: DollarSign },
    ...(isLoggedIn
      ? [{ label: 'Dashboard', route: '#dashboard', icon: Activity }]
      : [{ label: 'Sign In',   route: '#login',     icon: Lock }]
    ),
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

          {/* Right action area */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* User chip */}
                <button
                  onClick={() => handleNavClick('#dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-lg transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-slate-300 text-xs font-mono font-bold max-w-[100px] truncate">
                    {userName || 'My Account'}
                  </span>
                </button>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-400 text-xs font-mono font-bold rounded-lg hover:bg-red-950/20 transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('#login')}
                  className="px-4 py-2 text-sm font-mono font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="cta-quick-scan-nav"
                  onClick={() => handleNavClick('#scan')}
                  className="px-4 py-2 text-sm font-display font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Free Scan
                </button>
              </>
            )}
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
            
            <div className="pt-3 border-t border-slate-800 px-3 mt-2 space-y-2">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2.5 text-sm font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl hover:bg-red-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <button
                  id="cta-quick-scan-nav-mobile"
                  onClick={() => handleNavClick('#scan')}
                  className="w-full text-center px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all cursor-pointer"
                >
                  Free Market Scan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
