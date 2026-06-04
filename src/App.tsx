/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { getActiveSession, saveActiveSession } from './authService';
import CheckoutModal from './components/CheckoutModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { PageLoadingOverlay } from './components/LoadingSkeletons';
import { analytics } from './analytics';

// Lazy load heavy components for better initial load performance
const Homepage = lazy(() => import('./components/Homepage'));
const Radar = lazy(() => import('./components/Radar'));
const Campaign = lazy(() => import('./components/Campaign'));
const Pricing = lazy(() => import('./components/Pricing'));
const ScanForm = lazy(() => import('./components/ScanForm'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));
const AdminPortal = lazy(() => import('./components/AdminPortal'));

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
      
      // Track page view
      const pageName = hash.replace('#', '') || 'home';
      analytics.pageView(hash, `JobLeak - ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`);
      
      // Smooth instant scroll to top - NO LAG
      window.scrollTo({ top: 0, behavior: 'instant' });
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
      
      // Track analytics event
      analytics.track('scan_completed', {
        city,
        industry,
        service: serviceText,
      });
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
    // OPTIMIZED: Faster, smoother animations with no layout shift
    const pageVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };

    const transition = {
      duration: 0.15,
      ease: 'easeInOut'
    };

    // Wrap each route in Suspense for lazy loading
    const PageWrapper = ({ children }: { children: React.ReactNode }) => (
      <Suspense fallback={<PageLoadingOverlay message="Loading page..." />}>
        {children}
      </Suspense>
    );

    switch (currentRoute) {
      case '#home':
      case '':
        return (
          <motion.div
            key="home"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <Homepage onStartInstantScan={handleStartInstantScan} onRouteChange={handleRouteChange} />
            </PageWrapper>
          </motion.div>
        );
      
      case '#scan':
        return (
          <motion.div
            key="scan"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <ScanForm onScanComplete={handleScanComplete} onRouteChange={handleRouteChange} />
            </PageWrapper>
          </motion.div>
        );
      
      case '#radar':
        return (
          <motion.div
            key="radar"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <Radar 
                scannedData={scannedData} 
                onNavigateToCampaign={() => handleRouteChange('#campaign')} 
                onModifyScan={() => handleRouteChange('#scan')} 
              />
            </PageWrapper>
          </motion.div>
        );
      
      case '#campaign':
        return (
          <motion.div
            key="campaign"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <Campaign scannedData={scannedData} onNavigateToScan={() => handleRouteChange('#scan')} />
            </PageWrapper>
          </motion.div>
        );
      
      case '#pricing':
        return (
          <motion.div
            key="pricing"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <Pricing onSelectTier={handleSelectTier} />
            </PageWrapper>
          </motion.div>
        );
      
      case '#dashboard':
        return (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </motion.div>
        );
      
      case '#login':
        return (
          <motion.div
            key="login"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              {isLoggedIn ? <Dashboard /> : <Login onLoginSuccess={() => setIsLoggedIn(true)} />}
            </PageWrapper>
          </motion.div>
        );
      
      case '#admin':
        return (
          <motion.div
            key="admin"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <AdminPortal />
            </PageWrapper>
          </motion.div>
        );
      
      default:
        return (
          <motion.div
            key="default"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={transition}
          >
            <PageWrapper>
              <Homepage onStartInstantScan={handleStartInstantScan} onRouteChange={handleRouteChange} />
            </PageWrapper>
          </motion.div>
        );
    }
  };

  const isAdminRoute = currentRoute === '#admin';

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div id="jobleak-app-frame" className="min-h-screen bg-[#030712] flex flex-col justify-between font-sans text-slate-200 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Background Radial Glow Blobs */}
      <div className="absolute top-[5%] left-[-10%] w-[500px] h-[500px] rounded-full blue-glow-blob pointer-events-none z-0" />
      <div className="absolute top-[45%] right-[-10%] w-[600px] h-[600px] rounded-full indigo-glow-blob pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full blue-glow-blob pointer-events-none z-0" />

      {/* 1. Header Frame - Hidden strictly on Admin to separate portal look */}
      {!isAdminRoute && <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />}

      {/* 2. Primary Page Render - NO LAYOUT SHIFT */}
      <main className="flex-grow relative z-10 min-h-[80vh]">
        <AnimatePresence mode="wait" initial={false}>
          {renderPage()}
        </AnimatePresence>
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
      </ToastProvider>
    </ErrorBoundary>
  );
}
