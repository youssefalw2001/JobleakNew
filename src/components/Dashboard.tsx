/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Layers, 
  Plus, 
  LogOut, 
  CheckCircle, 
  Smartphone, 
  Calendar, 
  FileText, 
  PlusCircle, 
  Trash2,
  ShieldCheck,
  Award,
  Zap,
  Target,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Percent,
  Flame,
  ChevronRight,
  RefreshCw,
  Lock,
  AlertTriangle,
  CloudLightning,
  Building2,
  Search,
  Radio,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { getLocalLeads } from '../supabase';
import { Lead } from '../types';
import { getActiveSession, saveActiveSession, AuthUser, LoggedCall, BillingInvoice } from '../authService';
import {
  generateLiveFeed,
  FeedOpportunity,
  OpportunityType,
  UrgencyLevel,
  FEED_TYPE_CONFIG,
  URGENCY_CONFIG,
} from '../integrations/liveFeed';

// ── ActivatePlanForm — inline plan activation via Whop order ID ───────────────
function ActivatePlanForm({
  currentUser,
  onActivate,
}: {
  currentUser: AuthUser;
  onActivate: (updated: AuthUser) => void;
}) {
  const [orderId, setOrderId]     = useState('');
  const [plan, setPlan]           = useState<'Starter' | 'Growth' | 'Pro'>('Starter');
  const [status, setStatus]       = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSubmitting(true);

    // Simulate verification delay — in production this would call a webhook
    setTimeout(() => {
      const updated: AuthUser = {
        ...currentUser,
        subscriptionPlan: plan,
        billingHistory: [
          {
            id:        `act-${Date.now()}`,
            invoiceNo: `WHC-${orderId.trim().slice(-8).toUpperCase()}`,
            date:      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount:    plan === 'Starter' ? 99 : plan === 'Growth' ? 199 : 299,
            plan:      `${plan} Plan`,
            status:    'Paid',
          },
          ...(currentUser.billingHistory ?? []),
        ],
      };
      onActivate(updated);
      setStatus('success');
      setSubmitting(false);
    }, 1200);
  };

  if (status === 'success') {
    return (
      <div className="border-t border-blue-500/20 px-6 py-4 flex items-center gap-3 bg-emerald-500/5">
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
        <p className="text-sm font-bold text-emerald-300">
          {plan} plan activated. Reload to see your unlocked features.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="ml-auto text-xs font-mono font-bold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
        >
          Reload now
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleActivate}
      className="border-t border-blue-500/15 px-6 py-4 flex flex-col sm:flex-row items-end gap-3"
    >
      <div className="flex-1 min-w-0">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          Whop Order ID
        </label>
        <input
          type="text"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          placeholder="e.g. ord_xxxxxxxxxxxxxxxx"
          className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-blue-600 text-white text-sm px-4 py-2.5 rounded-lg outline-none transition-all font-mono placeholder:text-slate-700"
        />
      </div>
      <div className="shrink-0">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          Plan
        </label>
        <select
          value={plan}
          onChange={e => setPlan(e.target.value as any)}
          className="bg-slate-950 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-lg outline-none focus:border-blue-600 transition-all font-mono"
        >
          <option value="Starter">Starter — $99</option>
          <option value="Growth">Growth — $199</option>
          <option value="Pro">Pro — $299</option>
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitting || !orderId.trim()}
        className="shrink-0 px-5 py-2.5 bg-slate-800 border border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white text-sm font-mono font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {submitting ? (
          <><div className="w-4 h-4 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" /> Verifying...</>
        ) : (
          'Activate Plan'
        )}
      </motion.button>
      {status === 'error' && (
        <p className="text-xs font-mono text-red-400 w-full">Order ID not found. Contact support if this persists.</p>
      )}
    </form>
  );
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [localLeads, setLocalLeads]   = useState<Lead[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [showLogForm, setShowLogForm]       = useState(false);
  const [newCallerName, setNewCallerName]   = useState('');
  const [newCallNotes, setNewCallNotes]     = useState('');
  const [newCallStatus, setNewCallStatus]   = useState<'Inbound' | 'Outbound'>('Inbound');

  const [feed, setFeed]                     = useState<FeedOpportunity[]>([]);
  const [feedFilter, setFeedFilter]         = useState<OpportunityType | 'all'>('all');
  const [feedExpanded, setFeedExpanded]     = useState<string | null>(null);

  const [guestMetrics] = useState({ activeBids: 8, adSpendSaved: 150 });

  useEffect(() => {
    // Load from cache immediately — no flash of guest state
    const cached = getActiveSession();
    if (cached) {
      setCurrentUser(cached);
      setAuthLoading(false);
      setLocalLeads(getLocalLeads());
      setFeed(generateLiveFeed(
        cached.city?.split(',')[0] ?? 'Austin',
        cached.industry ?? 'HVAC',
        (cached.subscriptionPlan ?? 'Free Trial') as any,
      ));
    }

    // Then verify with Firebase and refresh if needed
    import('../firebase').then(async ({ auth, db }) => {
      auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const { getDoc, setDoc, doc } = await import('firebase/firestore');
            const userRef = doc(db, 'users', firebaseUser.uid);
            const snap    = await getDoc(userRef);

            let profile: AuthUser;

            if (snap.exists()) {
              profile = snap.data() as AuthUser;
            } else {
              // No profile yet — auto-create from Firebase Auth data
              profile = {
                id:               firebaseUser.uid,
                email:            firebaseUser.email ?? undefined,
                phone:            firebaseUser.phoneNumber ?? undefined,
                businessName:     firebaseUser.displayName || 'My Business',
                industry:         'HVAC',
                city:             'Austin, TX',
                subscriptionPlan: 'Free Trial',
                loggedCalls:      [],
                billingHistory:   [],
                adSpendSaved:     0,
                activeLeadsCount: 0,
              };
              await setDoc(userRef, profile);
            }

            saveActiveSession(profile);
            setCurrentUser(profile);
            setLocalLeads(getLocalLeads());
            setFeed(generateLiveFeed(
              profile.city?.split(',')[0] ?? 'Austin',
              profile.industry ?? 'HVAC',
              (profile.subscriptionPlan ?? 'Free Trial') as any,
            ));
          } catch (err) {
            console.error('Dashboard profile load error:', err);
            const fallback: AuthUser = {
              id:               firebaseUser.uid,
              email:            firebaseUser.email ?? undefined,
              businessName:     firebaseUser.displayName || 'My Business',
              industry:         'HVAC',
              city:             'Austin, TX',
              subscriptionPlan: 'Free Trial',
              loggedCalls:      [],
              billingHistory:   [],
              adSpendSaved:     0,
              activeLeadsCount: 0,
            };
            saveActiveSession(fallback);
            setCurrentUser(fallback);
            setFeed(generateLiveFeed('Austin', 'HVAC', 'Free Trial'));
          }
        } else {
          saveActiveSession(null);
          setCurrentUser(null);
          setFeed([]);
        }
        setAuthLoading(false);
      });
    }).catch(() => { setAuthLoading(false); });
  }, []);

  // Update session and save to localStorage
  const triggerSessionUpdate = (updated: AuthUser) => {
    setCurrentUser(updated);
    saveActiveSession(updated);
  };

  // Log Out operation
  const handleLogout = () => {
    import('../firebase').then(({ auth }) => {
      auth.signOut().then(() => {
        saveActiveSession(null);
        setCurrentUser(null);
        window.location.hash = '#home';
        window.location.reload();
      });
    }).catch(() => {
      saveActiveSession(null);
      setCurrentUser(null);
      window.location.hash = '#home';
      window.location.reload();
    });
  };

  // Quick submit handler to record a customized inbound call log for the active user
  const handleAddCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newCallerName.trim()) return;

    const newLogItem: LoggedCall = {
      id: `call-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      city: currentUser.city || 'Austin',
      industry: currentUser.industry || 'HVAC',
      status: newCallStatus as any,
      notes: `${newCallerName.trim()}: ${newCallNotes.trim() || 'Discussed emergency weather dispatched rate structures'}`
    };

    // Append and save locally to this specific authenticated user
    const updatedCalls = [newLogItem, ...(currentUser.loggedCalls || [])];
    
    // Simulate updating estimated ad savings and leads count
    const updatedUser: AuthUser = {
      ...currentUser,
      loggedCalls: updatedCalls,
      adSpendSaved: (currentUser.adSpendSaved || 0) + 75,
      activeLeadsCount: (currentUser.activeLeadsCount || 0) + 1
    };

    triggerSessionUpdate(updatedUser);
    
    // Reset form parameters
    setNewCallerName('');
    setNewCallNotes('');
    setShowLogForm(false);
  };

  // Delete a customized call log
  const handleDeleteCall = (id: string) => {
    if (!currentUser) return;
    const remaining = (currentUser.loggedCalls || []).filter(c => c.id !== id);
    const updatedUser = {
      ...currentUser,
      loggedCalls: remaining
    };
    triggerSessionUpdate(updatedUser);
  };

  // Clean, premium fallback leads list in case they haven't run a scan yet
  const defaultMockLeads: Lead[] = [
    {
      id: 'demo-hq-1',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      business_name: 'Apex Thermal & Climate',
      industry: 'HVAC',
      city: 'Austin',
      website: 'https://apexthermal.org',
      email: 'service@apexthermal.org',
      phone: '512-555-0122',
      goal: 'Acquire freeze replacement bids',
      status: 'qualified'
    },
    {
      id: 'demo-hq-2',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      business_name: 'Austin Roof Shield Guard',
      industry: 'Roofing',
      city: 'Austin',
      website: 'https://roofshield-austin.com',
      email: 'storm@roofshield-austin.com',
      phone: '512-555-8833',
      goal: 'Bypass bidding search fees',
      status: 'new'
    },
    {
      id: 'demo-hq-3',
      created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
      business_name: 'Metro Drain & Emergency Plumbing',
      industry: 'Plumbing',
      city: 'Phoenix',
      website: 'https://metrodrains-phx.net',
      email: 'phx-dispatch@metrodrains.net',
      phone: '602-555-9011',
      goal: 'Urgent heat stress pipes bypass',
      status: 'contacted'
    },
    {
      id: 'demo-hq-4',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      business_name: 'Florida Hurricane Shingle Spares',
      industry: 'Roofing',
      city: 'Tampa',
      website: 'https://floridashingleco.com',
      email: 'orders@floridashingle.com',
      phone: '813-555-3101',
      status: 'new',
      goal: 'Track high wind velocities immediately'
    }
  ];

  // Merge dynamic local inputs with relevant previews
  const initialLeadsList = [...localLeads, ...defaultMockLeads];

  // Dynamic filter: Show leads matching the user's registered preferences for a 100% bespoke feed!
  const filteredLeads = currentUser
    ? initialLeadsList.filter(l => 
        l.city.toLowerCase() === currentUser.city.toLowerCase() || 
        l.industry.toLowerCase() === currentUser.industry.toLowerCase()
      )
    : initialLeadsList;

  // Personalized Math Matrix Calculations
  const averageContractValue = 1350;
  const userPlan = currentUser?.subscriptionPlan || 'Free Trial';
  
  // Calculate dynamic LTD Billings based ONLY on their own closed logged calls
  const safeCalls = currentUser?.loggedCalls ?? [];
  const closedBookingsCount = currentUser 
    ? Math.max(1, safeCalls.filter(c => c.status === 'Inbound').length) 
    : 3;
  const dynamicBillings = closedBookingsCount * averageContractValue;

  return (
    <div id="dashboard-portal-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-all duration-300">
      
      {/* PERSONALIZED CONTROLLER BANNER - UPGRADED WITH ANIMATIONS */}
      {currentUser ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20 border border-slate-800 text-white rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden group"
        >
          {/* Animated background effects */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none admin-radar-grid" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
          
          <div className="space-y-3 relative z-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center space-x-3"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-3 py-1 rounded-full font-mono text-[10px] font-black uppercase bg-blue-600 text-white shadow-lg">
                {userPlan} Membership
              </span>
              <span className="text-slate-400 font-mono text-sm flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified Session
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-3xl font-display font-black text-white tracking-tight flex items-center gap-3"
            >
              <Target className="h-8 w-8 text-blue-400" />
              {currentUser.businessName || 'Active Dispatch'} Command Center
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-sm text-slate-300 font-mono flex flex-wrap gap-x-5 gap-y-2 items-center"
            >
              <span className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 font-bold">{currentUser.city}</span>
              </span>
              <span className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span className="text-indigo-300 font-bold">{currentUser.industry}</span>
              </span>
              <span className="text-slate-400">
                {currentUser.email || currentUser.phone}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 md:mt-0 relative z-10 flex shrink-0 space-x-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogForm(!showLogForm)}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-blue-500/30"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Log Call</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="dashboard-logout-action"
              onClick={handleLogout}
              className="px-5 py-3 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center space-x-2 cursor-pointer border border-slate-700"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </motion.div>
      ) : authLoading ? (
        /* ── LOADING STATE — never flashes guest banner while Firebase resolves ── */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">Loading your dashboard...</p>
            <p className="text-slate-500 text-xs font-mono mt-0.5">Verifying your session</p>
          </div>
        </div>
      ) : (
        /* ── GUEST BANNER — only shown when Firebase confirms no active session ── */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-display font-black text-xl text-white">
              Sign in to access your dashboard
            </h3>
            <p className="text-sm text-slate-400 font-mono leading-relaxed max-w-xl">
              Your live intelligence feed, campaign tools, ROI tracker, and market data are waiting. Sign in or create a free account in 30 seconds.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => { window.location.hash = '#login'; }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-display font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative z-10">Sign In</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => { window.location.hash = '#login'; }}
              className="px-6 py-3 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Create Free Account
            </motion.button>
          </div>
        </div>
      )}

      {/* DYNAMIC EXPANDING MANUAL CALL RECORDER FORM */}
      {showLogForm && currentUser && (
        <form onSubmit={handleAddCallLog} className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-blue-600" />
              Record Inbound/Outbound Call Conversation
            </h3>
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="text-sm text-slate-450 hover:text-slate-100 font-mono font-bold"
            >
              ✕ Collapse
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Client / Caller Name
              </label>
              <input
                type="text"
                required
                value={newCallerName}
                onChange={(e) => setNewCallerName(e.target.value)}
                placeholder="e.g. Martha Jenkins (Property Manager)"
                className="w-full bg-slate-900 border border-slate-600 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-slate-900 text-white font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Call Direction Channel
              </label>
              <select
                value={newCallStatus}
                onChange={(e) => setNewCallStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-600 text-sm px-2 px-2.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-white"
              >
                <option value="Inbound">Inbound Dial (Homeowner Lead)</option>
                <option value="Outbound">Outbound Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                Brief Call Log Coordinates / Notes
              </label>
              <input
                type="text"
                value={newCallNotes}
                onChange={(e) => setNewCallNotes(e.target.value)}
                placeholder="e.g. High storm leak reported. Booked inspection diagnostic at $99 fee."
                className="w-full bg-slate-900 border border-slate-600 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-slate-900 text-white font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-mono font-bold text-sm uppercase tracking-wider rounded-lg transition-all"
            >
              Add Call to My Account
            </button>
          </div>
        </form>
      )}

      {/* ── LIVE INTELLIGENCE FEED ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
      >
        {/* Feed header */}
        <div className="border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div>
              <h3 className="text-sm font-display font-black text-white">
                Live Intelligence Feed
              </h3>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                {currentUser
                  ? `${currentUser.city} · ${currentUser.industry} · Updated today`
                  : 'Monitoring your market 24/7'}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {([
              { key: 'all',           label: 'All' },
              { key: 'weather',       label: 'Weather' },
              { key: 'competitor_gap',label: 'Competitors' },
              { key: 'permit',        label: 'Permits' },
              { key: 'fema',          label: 'FEMA' },
              { key: 'search_spike',  label: 'Search' },
            ] as { key: OpportunityType | 'all'; label: string }[]).map(f => (
              <button
                key={f.key}
                onClick={() => setFeedFilter(f.key)}
                className={`shrink-0 px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  feedFilter === f.key
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                    : 'text-slate-600 hover:text-slate-300 border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed items */}
        <div className="divide-y divide-slate-800/60">
          {feed
            .filter(item => feedFilter === 'all' || item.type === feedFilter)
            .map((item, i) => {
              const typeCfg    = FEED_TYPE_CONFIG[item.type];
              const urgencyCfg = URGENCY_CONFIG[item.urgency];
              const isLocked   = !['Starter','Growth','Pro'].includes(
                currentUser?.subscriptionPlan ?? ''
              ) && item.planRequired !== 'Starter';
              const isExpanded = feedExpanded === item.id;
              const planGated  = item.planRequired === 'Growth' && !['Growth','Pro'].includes(currentUser?.subscriptionPlan ?? '');

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`transition-all ${planGated ? 'opacity-50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => !planGated && setFeedExpanded(isExpanded ? null : item.id)}
                    className={`w-full text-left px-6 py-4 hover:bg-slate-800/30 transition-all cursor-pointer ${isExpanded ? 'bg-slate-800/20' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Urgency dot */}
                      <div className="mt-1 shrink-0">
                        <span className={`w-2 h-2 rounded-full block ${urgencyCfg.dot} ${item.urgency === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Type badge */}
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-black rounded border ${typeCfg.bg} ${typeCfg.border} ${typeCfg.badgeColor} uppercase tracking-wider`}>
                            {typeCfg.label}
                          </span>
                          {/* Urgency */}
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-black rounded border ${urgencyCfg.bg} ${urgencyCfg.border} ${urgencyCfg.color} uppercase tracking-wider`}>
                            {item.urgency}
                          </span>
                          {/* New badge */}
                          {item.isNew && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-black rounded bg-blue-500 text-white uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                          {/* Plan gate */}
                          {planGated && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-black rounded bg-slate-800 border border-slate-700 text-slate-500 uppercase tracking-wider">
                              <Lock className="h-2.5 w-2.5" />
                              Growth
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-white leading-snug">{item.title}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                          <span className="text-[10px] font-mono text-slate-600">·</span>
                          <span className="text-[10px] font-mono text-slate-500">{item.source}</span>
                        </div>
                      </div>

                      {/* Right: revenue + expand */}
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-display font-black text-emerald-400">{item.estimatedRevenue}</div>
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5">{item.timeWindow}</div>
                        <ChevronRight className={`h-4 w-4 text-slate-600 mt-1 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && !planGated && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2 ml-6 space-y-4 border-t border-slate-800/60">
                          <p className="text-sm text-slate-400 font-mono leading-relaxed">
                            {item.description}
                          </p>
                          <div className={`flex items-start gap-3 p-3.5 ${typeCfg.bg} border ${typeCfg.border} rounded-xl`}>
                            <Zap className={`h-4 w-4 ${typeCfg.color} shrink-0 mt-0.5`} />
                            <div>
                              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-0.5">Recommended Action</p>
                              <p className={`text-sm font-bold ${typeCfg.color}`}>{item.action}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { window.location.hash = '#campaign'; onRouteChange && (window as any).__jobleak_route?.('#campaign'); }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer"
                            >
                              Build Campaign
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { window.location.hash = '#radar'; onRouteChange && (window as any).__jobleak_route?.('#radar'); }}
                              className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer hover:border-slate-600"
                            >
                              View Radar
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

          {feed.filter(item => feedFilter === 'all' || item.type === feedFilter).length === 0 && (
            <div className="px-6 py-10 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
              No signals match this filter right now.
            </div>
          )}
        </div>

        {/* Feed footer */}
        <div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-600">
            {feed.length} signals · refreshes daily
          </span>
          <button
            type="button"
            onClick={() => {
              const city     = currentUser?.city?.split(',')[0] ?? 'Austin';
              const industry = currentUser?.industry ?? 'HVAC';
              const plan     = currentUser?.subscriptionPlan ?? 'Starter';
              setFeed(generateLiveFeed(city, industry, plan));
              setFeedExpanded(null);
            }}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* 4-BENTO METRIC GRID WITH PREMIUM ANIMATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: LTD Billings dynamic - UPGRADED */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bento-card p-6 space-y-3 border-r-4 border-r-blue-600 overflow-hidden cursor-pointer"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">LTD EST. CONTRACT REVENUE</span>
              <motion.span 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >
                <TrendingUp className="h-5 w-5" />
              </motion.span>
            </div>
            
            <motion.h3 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-display font-black text-white mb-2"
            >
              ${dynamicBillings.toLocaleString()}
            </motion.h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Calculated at <span className="text-blue-400 font-mono font-bold">${averageContractValue}</span> avg per active lead dial.
            </p>
            
            {/* Animated progress bar */}
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '85%' }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Calls Logged Dynamic - UPGRADED */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bento-card p-6 space-y-3 border-r-4 border-r-indigo-600 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">MY REGISTERED CALLS</span>
              <motion.span
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >
                <Users className="h-5 w-5" />
              </motion.span>
            </div>
            
            <motion.h3
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl font-display font-black text-white mb-2"
            >
              {currentUser ? (currentUser.loggedCalls ?? []).length : 12}
            </motion.h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {currentUser ? 'Recorded specifically under your profile.' : 'Total simulated contractor calls.'}
            </p>
            
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '65%' }}
                transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Ad Spend Saved - UPGRADED */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bento-card p-6 space-y-3 border-r-4 border-r-emerald-600 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">ESTIMATED AD SAVINGS</span>
              <motion.span
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                <DollarSign className="h-5 w-5" />
              </motion.span>
            </div>
            
            <motion.h3
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-4xl font-display font-black text-white mb-2"
            >
              ${currentUser ? currentUser.adSpendSaved.toLocaleString() : '1,450'}
            </motion.h3>
            
            <p className="text-xs text-emerald-400 font-sans leading-relaxed flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Blocked wasteful broad keywords
            </p>
            
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '92%' }}
                transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Active Plan - UPGRADED */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group relative bento-card p-6 space-y-3 border-r-4 border-r-orange-600 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">ACTIVE PLAN PACKAGE</span>
              <motion.span
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                <Zap className="h-5 w-5" />
              </motion.span>
            </div>
            
            <motion.h3
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2"
            >
              {userPlan}
            </motion.h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Matched region: <span className="text-orange-400 font-mono font-bold">{currentUser ? currentUser.city : 'All Metros'}</span>
            </p>
            
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
              />
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── ACTIVATE PLAN ────────────────────────────────────────────────────── */}
      {currentUser && userPlan === 'Free Trial' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="bg-gradient-to-br from-blue-600/10 via-indigo-600/8 to-slate-900 border border-blue-500/30 rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Left */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-display font-black text-white">
                  Activate Your Plan
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5 leading-relaxed">
                  Already paid on Whop? Enter your order ID below to unlock your plan features instantly.
                </p>
              </div>
            </div>

            {/* Right — plan buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {([
                { name: 'Starter', price: '$99', url: 'https://whop.com/checkout/plan_txHzVnJkSgWey' },
                { name: 'Growth',  price: '$199', url: 'https://whop.com/checkout/plan_NY1zTd8pFbhch' },
                { name: 'Pro',     price: '$299', url: 'https://whop.com/checkout/plan_VUIIv64AQrBer' },
              ] as const).map(plan => (
                <motion.button
                  key={plan.name}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.open(plan.url, '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {plan.name} {plan.price}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Activate with order ID */}
          <ActivatePlanForm currentUser={currentUser} onActivate={triggerSessionUpdate} />
        </motion.div>
      )}

      {/* Upgrade banner for Starter users — nudge toward Growth */}
      {currentUser && userPlan === 'Starter' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Unlock Competitor Intel + Permit Feeds</p>
              <p className="text-xs font-mono text-slate-500">Growth plan adds real Google Maps competitor data, FEMA alerts, and Census permits.</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://whop.com/checkout/plan_NY1zTd8pFbhch', '_blank', 'noopener,noreferrer')}
            className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-mono font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all"
          >
            Upgrade $199
          </motion.button>
        </motion.div>
      )}

      {/* ── ROI CALCULATOR ──────────────────────────────────────────────────── */}
      {(() => {
        // Plan cost lookup
        const planCost: Record<string, number> = { Starter: 99, Growth: 199, Pro: 299, 'Free Trial': 0 };
        const monthlyCost = planCost[userPlan] ?? 199;

        // Inbound calls this month (treat all logged calls as "this month" for demo)
        const inboundCalls = currentUser
          ? (currentUser.loggedCalls ?? []).filter(c => c.status === 'Inbound').length
          : 0;

        // Revenue generated from logged calls
        const revenueGenerated = inboundCalls * averageContractValue;

        // ROI % = ((revenue - cost) / cost) * 100  — floor at 0 to avoid negatives when no calls
        const roiPct = monthlyCost > 0 && revenueGenerated > 0
          ? Math.round(((revenueGenerated - monthlyCost) / monthlyCost) * 100)
          : 0;

        // Breakeven = how many calls needed to cover the plan
        const breakevenCalls = monthlyCost > 0
          ? Math.ceil(monthlyCost / averageContractValue)
          : 0;

        // Progress toward breakeven (cap at 100%)
        const breakevenProgress = breakevenCalls > 0
          ? Math.min(100, Math.round((inboundCalls / breakevenCalls) * 100))
          : 100;

        const isBreakeven = inboundCalls >= breakevenCalls && monthlyCost > 0;

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-display font-black text-white flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                JobLeak ROI Calculator
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  {userPlan} · ${monthlyCost}/mo
                </span>
                {isBreakeven && monthlyCost > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-black rounded uppercase tracking-widest">
                    Breakeven Reached
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {currentUser && inboundCalls > 0 ? (
                /* ── ACTIVE STATE: user has logged calls ── */
                <div className="space-y-6">
                  {/* Big ROI number */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Your JobLeak ROI this month
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="flex items-end gap-3"
                      >
                        <span className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                          {roiPct.toLocaleString()}%
                        </span>
                        <ArrowUpRight className="h-7 w-7 text-emerald-400 mb-1.5" />
                      </motion.div>
                      <p className="text-slate-500 text-xs font-mono mt-1.5">
                        Based on {inboundCalls} inbound {inboundCalls === 1 ? 'call' : 'calls'} ×{' '}
                        <span className="text-white font-bold">${averageContractValue.toLocaleString()}</span> avg ticket
                        vs <span className="text-slate-400">${monthlyCost}/mo plan cost</span>
                      </p>
                    </div>

                    {/* Stat tiles */}
                    <div className="flex gap-3 sm:ml-auto">
                      {[
                        { label: 'Revenue Generated', value: `$${revenueGenerated.toLocaleString()}`, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                        { label: 'Plan Cost',          value: `$${monthlyCost}`,                       color: 'text-slate-400',   border: 'border-slate-700',       bg: 'bg-slate-800/50' },
                        { label: 'Net Profit',         value: `$${(revenueGenerated - monthlyCost).toLocaleString()}`, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
                      ].map(tile => (
                        <div key={tile.label} className={`${tile.bg} border ${tile.border} rounded-xl px-4 py-3 text-center min-w-[96px]`}>
                          <div className={`text-xl font-display font-black ${tile.color}`}>{tile.value}</div>
                          <div className="text-[9px] font-mono text-slate-600 mt-0.5 uppercase tracking-wider leading-tight">{tile.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakeven progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Breakeven Progress
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {inboundCalls} / {breakevenCalls} calls needed to cover plan cost
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                        style={{ width: `${breakevenProgress}%`, transformOrigin: 'left' }}
                        className={`h-full rounded-full ${
                          isBreakeven
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-slate-600">
                      {isBreakeven
                        ? `All ${inboundCalls} calls logged — plan fully recovered. Every additional call is pure profit.`
                        : `${breakevenCalls - inboundCalls} more inbound ${breakevenCalls - inboundCalls === 1 ? 'call' : 'calls'} needed to break even.`}
                    </p>
                  </div>
                </div>
              ) : (
                /* ── EMPTY STATE: no calls logged yet ── */
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Left: projection */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Projected ROI at breakeven
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-display font-black text-slate-300">
                          {monthlyCost > 0
                            ? `${Math.round(((breakevenCalls * averageContractValue - monthlyCost) / monthlyCost) * 100)}%`
                            : 'N/A'}
                        </span>
                        <Percent className="h-5 w-5 text-slate-500 mb-1.5" />
                      </div>
                      <p className="text-xs text-slate-600 font-mono mt-1">
                        You need just{' '}
                        <span className="text-white font-bold">{breakevenCalls} inbound {breakevenCalls === 1 ? 'call' : 'calls'}</span>
                        {' '}to fully recover your ${monthlyCost}/mo investment.
                      </p>
                    </div>

                    {/* Projection tiles */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { calls: 1,  label: '1 call' },
                        { calls: 3,  label: '3 calls' },
                        { calls: 10, label: '10 calls' },
                      ].map(({ calls, label }) => {
                        const rev = calls * averageContractValue;
                        const roi = monthlyCost > 0 ? Math.round(((rev - monthlyCost) / monthlyCost) * 100) : 0;
                        return (
                          <div key={calls} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
                            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">{label}</div>
                            <div className={`text-lg font-display font-black ${roi > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {roi > 0 ? `+${roi}%` : `${roi}%`}
                            </div>
                            <div className="text-[9px] font-mono text-slate-600 mt-0.5">${rev.toLocaleString()} rev</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: CTA */}
                  <div className="sm:w-56 bg-blue-500/5 border border-blue-500/15 rounded-xl p-5 text-center space-y-3">
                    <DollarSign className="h-8 w-8 text-blue-400 mx-auto" />
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      Log your first inbound call above to start tracking real ROI.
                    </p>
                    <button
                      onClick={() => {
                        // scroll to top to reveal Log Call button
                        document.getElementById('dashboard-portal-root')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-mono font-black uppercase tracking-widest rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
                    >
                      Log First Call
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* CORE TABLES WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TAB 1: LOGGED CALLS BOARD (BASED ENTIRELY OFF THEIR REAL DATA) */}
        <div className="lg:col-span-6 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">My Inbound Communications Log</h3>
              <p className="text-[11px] text-slate-400 font-mono">Isolated strictly to your current logged account session</p>
            </div>
            <span className="px-2 py-0.5 bg-blue-100/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold rounded uppercase">
              {currentUser ? `${(currentUser.loggedCalls ?? []).length} logs` : 'Sample Data'}
            </span>
          </div>

          {currentUser ? (
            (currentUser.loggedCalls ?? []).length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-slate-900/50/50 rounded-xl border border-dashed border-slate-700">
                <Smartphone className="h-10 w-10 text-slate-350 mx-auto" />
                <h4 className="text-sm font-bold font-mono text-slate-650">No Captured Communications Available</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Click the <strong>"Log Manual Call"</strong> tab above to record conversation details and view instant math computations.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(currentUser.loggedCalls ?? []).map((call) => (
                  <div key={call.id} className="bg-slate-900/50 border border-slate-150 rounded-xl p-4 flex items-start justify-between hover:border-slate-600 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                          call.status === 'Inbound' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-850 text-indigo-800'
                        }`}>
                          {call.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(call.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-100">{call.notes}</p>
                      
                      <div className="text-[9px] font-mono text-slate-400">
                        Signal: {call.city} • {call.industry} Services Trade
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCall(call.id)}
                      className="text-slate-400 hover:text-red-650 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Erase log record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* PREVIEW IF THE USER IS OUT */
            <div className="space-y-3.5">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-505 text-slate-400 flex flex-col justify-center text-center space-y-2">
                <p>Authentic call recordings are initialized empty upon registration, ensuring your customers remain 100% private and protected from public view.</p>
                <div className="bg-slate-900 p-3 rounded font-mono text-[10px] text-slate-400 text-left leading-normal border border-slate-700">
                  <strong className="text-slate-100 uppercase text-[9px] block mb-1">Standard Preview Data:</strong>
                  • Inbound Call: Alex Jenkins HVAC Repairs Austin (Completed)<br />
                  • Outbound Dial: Austin Roof Damage (Awaiting Followup)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: PERSONALIZED BILLING HISTORY & INVOICE LEDGER */}
        <div className="lg:col-span-6 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Billing History & Dynamic Invoices</h3>
              <p className="text-[11px] text-slate-400 font-mono">Real subscription invoices corresponding to your registered tier</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase">
              {currentUser ? 'SECURE ACCOUNT' : 'PREVIEW'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-mono uppercase tracking-wider">
                  <th className="py-2.5 px-3">Invoice No.</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3">Package / Tier</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-200">
                {currentUser ? (
                  (currentUser.billingHistory ?? []).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/50/50 transition-colors font-mono">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-450 text-slate-400 shrink-0" />
                        <span>{inv.invoiceNo}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{inv.date}</td>
                      <td className="py-3 px-3 font-sans text-slate-100">{inv.plan}</td>
                      <td className="py-3 px-3 font-bold text-white">${inv.amount} USD</td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-semibold uppercase ${
                          inv.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* MOCK INVOICE PREVIEW */
                  <>
                    <tr className="font-mono text-slate-400 border-b border-slate-800">
                      <td className="py-3 px-3 font-bold text-white">INV-2026-001</td>
                      <td className="py-3 px-3">02 June 2026</td>
                      <td className="py-3 px-3 font-sans text-slate-200">Pro Membership</td>
                      <td className="py-3 px-3 font-bold text-white">$499 USD</td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 uppercase font-mono font-semibold rounded border border-emerald-500/30">
                          PAID
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-blue-50/40 border border-blue-105 border-blue-100 rounded-lg text-[11px] leading-relaxed text-slate-300">
            <h5 className="font-bold text-blue-900 uppercase text-[9px] tracking-wide mb-0.5">Note on isolated security:</h5>
            We encrypt financial parameters using secure sandbox frameworks. Your actual credit card charges will never be listed publicly to other visitors.
          </div>
        </div>

      </div>

      {/* THIRD BLOCK: THE REGIONAL LEAD SCAN GRID CODES */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-1.5">
              <Award className="h-5 w-5 text-blue-600" />
              Contractor Leads Intelligence Feed
            </h3>
            <p className="text-sm text-slate-400">
              {currentUser 
                ? `System filtered precisely for ${currentUser.city} and ${currentUser.industry} service requests` 
                : 'Broad geocoded stream matches regional public bids'}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-200 text-[10px] font-mono font-bold rounded">
            {filteredLeads.length} METRICS MATCHED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-[9px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Business / Industry Group</th>
                <th className="py-3 px-4">Municipal Target</th>
                <th className="py-3 px-4">Checked/Scanned Date</th>
                <th className="py-3 px-4">Contractor Objective</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-750">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-900/50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{lead.business_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{lead.industry} • {lead.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-white">
                    {lead.city}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {lead.goal || 'No objective specified'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      lead.status === 'new' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : lead.status === 'qualified'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : 'bg-slate-150 text-slate-650'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
