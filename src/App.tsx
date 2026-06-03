/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './components/Homepage';
import Radar from './components/Radar';
import Campaign from './components/Campaign';
import Pricing from './components/Pricing';
import ScanForm from './components/ScanForm';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import { getActiveSession, saveActiveSession } from './authService';
import CheckoutModal from './components/CheckoutModal';

const SCANNED_DATA_CACHE_KEY = 'jobleak_scanned_data_cache';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('#home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    import('./firebase').then(({ auth, handleFirestoreError }) => {
      auth.onAuthStateChanged((user) => {
        setIsLoggedIn(!!user);
        setAuthInitialized(true);
      });
    }).catch(err => {
      console.warn("Firebase not setup yet, using default auth", err);
      setIsLoggedIn(!!getActiveSession());
      setAuthInitialized(true);
    });
  }, []);
  const [checkoutPlay, setCheckoutPlay] = useState<{
    name: 'Starter' | 'Growth' | 'Pro';
    price: number;
  } | null>(null);
  const [scannedData, setScannedData] = useState<{
    city: string;
    industry: string;
    serviceText: string;
  } | null>(null);

  // Sync route and checked cache state from local storage on mount
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setCurrentRoute(hash);
      // Automatically scroll window to top for standard high quality UX transit
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    // Verify if there is an active prefilled scan from previous session
    try {
      const cached = localStorage.getItem(SCANNED_DATA_CACHE_KEY);
      if (cached) {
        setScannedData(JSON.parse(cached));
      }
    } catch(e) {
      console.warn('Scanned data cache read failed in App load:', e);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleScanComplete = (city: string, industry: string, serviceText: string) => {
    const dataObj = { city, industry, serviceText };
    setScannedData(dataObj);
    try {
      localStorage.setItem(SCANNED_DATA_CACHE_KEY, JSON.stringify(dataObj));
    } catch(e) {
      console.error('Failed to cache scanned data:', e);
    }
  };

  const handleStartInstantScan = (city: string, industry: string, serviceText: string) => {
    handleScanComplete(city, industry, serviceText);
    window.location.hash = '#radar';
    setCurrentRoute('#radar');
  };

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
  };

  const handlePaymentSuccess = () => {
    if (!checkoutPlay) return;
    const session = getActiveSession();
    if (session) {
      const updatedUser = { 
        ...session, 
        subscriptionPlan: checkoutPlay.name,
        billingHistory: [
          {
            id: `invoice-${Math.random().toString(36).substring(2, 6)}`,
            invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: checkoutPlay.price,
            plan: `${checkoutPlay.name} Plan`,
            status: 'Paid' as const
          },
          ...session.billingHistory
        ]
      };
      saveActiveSession(updatedUser);
      setIsLoggedIn(true);
      handleRouteChange('#dashboard');
    }
    setCheckoutPlay(null);
  };

  const handleSelectTier = (tierName: string) => {
    const session = getActiveSession();
    let mappedPlan: 'Starter' | 'Growth' | 'Pro' = 'Growth';
    let price = 199;
    if (tierName === 'Starter' || tierName === 'Standard') {
      mappedPlan = 'Starter';
      price = 99;
    } else if (tierName === 'Pro' || tierName === 'Enterprise') {
      mappedPlan = 'Pro';
      price = 299;
    }

    if (session) {
      setCheckoutPlay({ name: mappedPlan, price });
      return;
    }

    // Default fallback if not registered yet
    localStorage.setItem('jobleak_pending_signup_plan', mappedPlan);
    alert(`Excellent choice! Let's register your company profile first to activate your ${mappedPlan} intelligence key.`);
    handleRouteChange('#login');
  };

  // Compute layout structure on route mapping
  const renderPage = () => {
    switch (currentRoute) {
      case '#home':
      case '':
        return <Homepage onStartInstantScan={handleStartInstantScan} onRouteChange={handleRouteChange} />;
      
      case '#scan':
        return <ScanForm onScanComplete={handleScanComplete} onRouteChange={handleRouteChange} />;
      
      case '#radar':
        return (
          <Radar 
            scannedData={scannedData} 
            onNavigateToCampaign={() => handleRouteChange('#campaign')} 
            onModifyScan={() => handleRouteChange('#scan')} 
          />
        );
      
      case '#campaign':
        return <Campaign scannedData={scannedData} onNavigateToScan={() => handleRouteChange('#scan')} />;
      
      case '#pricing':
        return <Pricing onSelectTier={handleSelectTier} />;
      
      case '#dashboard':
        return <Dashboard />;
      
      case '#login':
        return isLoggedIn ? <Dashboard /> : <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
      
      case '#admin':
        return <AdminPortal />;
      
      default:
        return <Homepage onStartInstantScan={handleStartInstantScan} onRouteChange={handleRouteChange} />;
    }
  };

  const isAdminRoute = currentRoute === '#admin';

  return (
    <div id="jobleak-app-frame" className="min-h-screen bg-[#030712] flex flex-col justify-between font-sans text-slate-200 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Radial Glow Blobs */}
      <div className="absolute top-[5%] left-[-10%] w-[500px] h-[500px] rounded-full blue-glow-blob pointer-events-none z-0" />
      <div className="absolute top-[45%] right-[-10%] w-[600px] h-[600px] rounded-full indigo-glow-blob pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full blue-glow-blob pointer-events-none z-0" />

      {/* 1. Header Frame - Hidden strictly on Admin to separate portal look */}
      {!isAdminRoute && <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />}

      {/* 2. Primary Page Render */}
      <main className="flex-grow relative z-10">
        {renderPage()}
      </main>

      {/* 3. Footer Frame */}
      <Footer onRouteChange={handleRouteChange} />

      <CheckoutModal
        isOpen={checkoutPlay !== null}
        onClose={() => setCheckoutPlay(null)}
        planName={checkoutPlay?.name || 'Growth'}
        price={checkoutPlay?.price || 199}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
