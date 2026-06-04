/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RISK SCANNER — Deep Market Audit™ with terminal intelligence animation
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scan,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Activity,
  Shield,
  Radio,
  Database,
  Cpu,
  Lock,
  DollarSign,
  Zap,
  BarChart3,
  AlertTriangle,
  LogIn,
  ExternalLink,
} from 'lucide-react';
import { StatesList } from '../types';
import { getActiveSession } from '../authService';

// ── Scan limit constants ───────────────────────────────────────────────────────
const FREE_SCAN_KEY = 'jobleak_free_scan_used';
const WHOP_STARTER  = 'https://whop.com/checkout/plan_txHzVnJkSgWey';

interface ScanFormProps {
  onScanComplete: (city: string, industry: string, serviceText: string) => void;
  onRouteChange: (route: string) => void;
}

// ── Trade ticket values & demand estimator ────────────────────────────────────
const TRADE_DATA: Record<string, {
  avgTicket: number;
  emergencyTicket: number;
  weeklyLeads: [number, number]; // [min, max] range
  unit: string;
}> = {
  'HVAC':         { avgTicket: 1350, emergencyTicket: 2200, weeklyLeads: [8,  22], unit: 'HVAC job' },
  'Roofing':      { avgTicket: 9500, emergencyTicket: 14000, weeklyLeads: [3, 10], unit: 'roofing project' },
  'Plumbing':     { avgTicket: 650,  emergencyTicket: 1100,  weeklyLeads: [12, 28], unit: 'plumbing call' },
  'Electrical':   { avgTicket: 850,  emergencyTicket: 1600,  weeklyLeads: [8,  18], unit: 'electrical job' },
  'Pest Control': { avgTicket: 320,  emergencyTicket: 580,   weeklyLeads: [15, 35], unit: 'pest control visit' },
  'Garage Door':  { avgTicket: 480,  emergencyTicket: 850,   weeklyLeads: [10, 24], unit: 'garage door call' },
};

function getTradeData(industry: string) {
  return TRADE_DATA[industry] ?? TRADE_DATA['HVAC'];
}

// Seeded demand volume from city + score (no random flicker)
function getDemandVolume(city: string, industry: string): number {
  const seed = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const trade = getTradeData(industry);
  const [min, max] = trade.weeklyLeads;
  return min + (seed % (max - min + 1));
}

export default function ScanForm({ onScanComplete, onRouteChange }: ScanFormProps) {
  // SIMPLIFIED: Only 3 core fields
  const [selectedState, setSelectedState] = useState('TX');
  const [city, setCity] = useState('Austin');
  const [industry, setIndustry] = useState('HVAC');
  const [serviceType, setServiceType] = useState('Emergency AC Repair');

  const [scanning, setScanning]             = useState(false);
  const [scanPhase, setScanPhase]           = useState(0);
  const [terminalLines, setTerminalLines]   = useState<string[]>([]);
  const [scanComplete, setScanComplete]     = useState(false);
  const terminalRef                         = useRef<HTMLDivElement>(null);

  // ── Gate state ──────────────────────────────────────────────────────────────
  const [showPaywall, setShowPaywall]       = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Reactive auth state — re-evaluates on every render so it's always current
  const [sessionState, setSessionState] = useState(() => getActiveSession());

  useEffect(() => {
    // Re-check session whenever the component mounts or regains focus
    setSessionState(getActiveSession());
    const onFocus = () => setSessionState(getActiveSession());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const isLoggedIn   = !!sessionState;
  const freeScanUsed = localStorage.getItem(FREE_SCAN_KEY) === '1';
  const isPaidUser   = isLoggedIn &&
    ['Starter', 'Growth', 'Pro'].includes(sessionState?.subscriptionPlan ?? '');

  // Auto-update cities when state changes
  useEffect(() => {
    const list = StatesList.find(s => s.code === selectedState)?.cities || [];
    if (list.length > 0 && !list.includes(city)) {
      setCity(list[0]);
    }
  }, [selectedState]);

  // Terminal lines keyed to city/industry
  const buildTerminalScript = (city: string, industry: string, service: string) => [
    `> INITIALIZING JOBLEAK DEEP MARKET AUDIT™ v3.1`,
    `> TARGET MARKET: ${city.toUpperCase()}, ${StatesList.find(s => s.cities.includes(city))?.code || 'US'}`,
    `> TRADE VERTICAL: ${industry.toUpperCase()} SERVICES`,
    `> SERVICE SCOPE: ${service.toUpperCase()}`,
    `> ─────────────────────────────────────────────`,
    `> [FEED 1/6] Connecting to Open-Meteo geocoding API...`,
    `> [FEED 1/6] Coordinates resolved: ${city} region locked`,
    `> [FEED 2/6] Pulling 5-day NWS weather forecast...`,
    `> [FEED 2/6] Analyzing temperature anomalies, wind shear, precipitation index`,
    `> [FEED 3/6] Scanning municipal permit registry — ${city} county...`,
    `> [FEED 3/6] ${Math.floor(Math.random() * 30) + 20} active ${industry} permits detected in last 30 days`,
    `> [FEED 4/6] Querying Google Search intent vectors...`,
    `> [FEED 4/6] Keyword velocity spike detected: "${service.toLowerCase()}"`,
    `> [FEED 5/6] Mapping competitor ad density in ${city} metro...`,
    `> [FEED 5/6] Analyzing CPC pressure across ${Math.floor(Math.random() * 12) + 8} active advertisers`,
    `> [FEED 6/6] Indexing community signal boards (Reddit, local forums)...`,
    `> [FEED 6/6] ${Math.floor(Math.random() * 8) + 3} high-intent community posts found`,
    `> ─────────────────────────────────────────────`,
    `> COMPUTING OPPORTUNITY SCORE...`,
    `> BUILDING CAMPAIGN ASSETS...`,
    `> AUDIT COMPLETE — ROUTING TO INTELLIGENCE DASHBOARD`,
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Gate: free scan used + not paid ────────────────────────────────────
    if (!isPaidUser && freeScanUsed) {
      setShowPaywall(true);
      return;
    }

    setScanning(true);
    setScanPhase(0);
    setTerminalLines([]);
    setScanComplete(false);

    const script = buildTerminalScript(city, industry, serviceType);
    let i = 0;

    const addLine = () => {
      if (i >= script.length) {
        setScanComplete(true);

        // Mark free scan as used for non-paid users
        if (!isPaidUser) {
          localStorage.setItem(FREE_SCAN_KEY, '1');
        }

        // Save scan data immediately
        onScanComplete(city, industry, serviceType);

        // Determine where to send the user
        if (!isLoggedIn) {
          // Not logged in — show login prompt, let them choose
          setShowLoginPrompt(true);
          return;
        }

        // Logged in + paid — route straight to Radar after estimator display
        setTimeout(() => {
          try {
            onRouteChange('#radar');
          } catch (e) {
            // Fallback — direct hash change always works
            window.location.hash = '#radar';
          }
        }, 4200);
        return;
      }

      // Phase transitions drive the visual stages
      if (i === 0)  setScanPhase(1);
      if (i === 5)  setScanPhase(2);
      if (i === 9)  setScanPhase(3);
      if (i === 13) setScanPhase(4);
      if (i === 17) setScanPhase(5);

      setTerminalLines(prev => [...prev, script[i]]);
      i++;

      // Auto-scroll terminal
      requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });

      // Variable speed — faster for data lines, pause on section breaks
      const isBreak = script[i - 1]?.startsWith('> ─');
      const delay = isBreak ? 400 : (i < 4 ? 120 : 90);
      setTimeout(addLine, delay);
    };

    setTimeout(addLine, 300);
  };

  // Quick presets for demo
  const quickPresets = [
    { label: 'Phoenix Heat Wave', city: 'Phoenix', state: 'AZ', industry: 'HVAC', service: 'Emergency AC Repair' },
    { label: 'Houston Storm', city: 'Houston', state: 'TX', industry: 'Roofing', service: 'Storm Damage Repair' },
    { label: 'Denver Freeze', city: 'Denver', state: 'CO', industry: 'Plumbing', service: 'Frozen Pipe Emergency' }
  ];

  const applyPreset = (preset: typeof quickPresets[0]) => {
    setSelectedState(preset.state);
    setCity(preset.city);
    setIndustry(preset.industry);
    setServiceType(preset.service);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* ─── PAYWALL OVERLAY — free scan already used ─── */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-6"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-orange-400" />
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-black text-white tracking-tight">
                  Free Scan Used
                </h2>
                <p className="text-slate-400 font-mono text-sm leading-relaxed">
                  You've used your free Deep Market Audit™. Upgrade to run unlimited scans and unlock your full intelligence dashboard.
                </p>
              </div>

              {/* What they get */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2">
                {[
                  'Unlimited scans — any city, any trade',
                  'Live intelligence feed updated daily',
                  'Google Ads campaign generator',
                  'Competitor intel + permit feeds',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(WHOP_STARTER, '_blank', 'noopener,noreferrer')}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="relative z-10">Upgrade — Starter $99/mo</span>
                  <ExternalLink className="h-4 w-4 relative z-10" />
                </motion.button>
                <button
                  type="button"
                  onClick={() => { window.location.hash = '#login'; }}
                  className="w-full py-3 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-mono font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Already have an account? Sign in
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LOGIN PROMPT — after free scan for unregistered users ─── */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-6"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-black text-white tracking-tight">
                  Audit Complete
                </h2>
                <p className="text-slate-400 font-mono text-sm leading-relaxed">
                  Your intelligence report is ready. Create a free account to save your results, access your dashboard, and deploy your campaign.
                </p>
              </div>

              {/* Value preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2">
                {[
                  'Save and revisit your market scan',
                  'Live intelligence feed for your city',
                  'Download your Google Ads campaign',
                  'Track ROI and logged calls',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowLoginPrompt(false); onRouteChange('#login'); }}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <LogIn className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Create Free Account</span>
                </motion.button>
                <button
                  type="button"
                  onClick={() => { setShowLoginPrompt(false); onRouteChange('#radar'); }}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-300 font-mono text-sm transition-colors cursor-pointer"
                >
                  View results without saving
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FULL-SCREEN INTELLIGENCE TERMINAL OVERLAY ─── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
          >
            {/* Terminal top bar */}
            <div className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="text-slate-500 text-xs font-mono ml-2">jobleak — deep-market-audit™ — {city.toLowerCase()}-{industry.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-blue-400 text-xs font-mono font-bold">SCANNING</span>
              </div>
            </div>

            {/* Phase progress strip */}
            <div className="grid grid-cols-5 border-b border-slate-800 shrink-0">
              {[
                { label: 'Initialize', icon: Cpu },
                { label: 'Weather', icon: Radio },
                { label: 'Permits', icon: Database },
                { label: 'Search Intent', icon: Activity },
                { label: 'Community', icon: Shield },
              ].map((phase, i) => (
                <div key={i} className={`px-4 py-3 flex items-center gap-2 border-r border-slate-800 last:border-r-0 transition-all duration-500 ${
                  scanPhase > i
                    ? 'bg-blue-500/10'
                    : scanPhase === i + 1
                    ? 'bg-blue-500/5'
                    : ''
                }`}>
                  <phase.icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    scanPhase > i ? 'text-blue-400' : scanPhase === i + 1 ? 'text-slate-400 animate-pulse' : 'text-slate-700'
                  }`} />
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest hidden sm:block transition-colors ${
                    scanPhase > i ? 'text-blue-400' : scanPhase === i + 1 ? 'text-slate-400' : 'text-slate-700'
                  }`}>{phase.label}</span>
                  {scanPhase > i && <CheckCircle className="h-3 w-3 text-blue-400 ml-auto shrink-0" />}
                </div>
              ))}
            </div>

            {/* Terminal body */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-6 sm:p-10 font-mono text-sm leading-relaxed"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="max-w-3xl mx-auto space-y-1.5">
                <AnimatePresence>
                  {terminalLines.map((line, i) => {
                    const isSection  = line.startsWith('> ─');
                    const isHeader   = i < 4;
                    const isFeed     = line.includes('[FEED') && !line.includes('Connecting') && !line.includes('Pulling') && !line.includes('Scanning') && !line.includes('Querying') && !line.includes('Mapping') && !line.includes('Indexing');
                    const isComplete = line.includes('COMPLETE') || line.includes('ROUTING');
                    const isBuilding = line.includes('COMPUTING') || line.includes('BUILDING');
                    const isData     = line.includes('detected') || line.includes('found') || line.includes('spike') || line.includes('resolved') || line.includes('locked');

                    let textColor = 'text-slate-400';
                    if (isSection)   textColor = 'text-slate-700';
                    if (isHeader)    textColor = 'text-slate-300';
                    if (isFeed)      textColor = 'text-blue-300';
                    if (isData)      textColor = 'text-emerald-400';
                    if (isBuilding)  textColor = 'text-yellow-400';
                    if (isComplete)  textColor = 'text-emerald-300 font-bold';

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`${textColor} ${isSection ? 'py-1' : ''}`}
                      >
                        {line}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Blinking cursor */}
                {!scanComplete && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-400">{'>'}</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-blue-400"
                    />
                  </div>
                )}

                {/* Complete state — Earnings Estimator */}
                {scanComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-6 pt-6 border-t border-slate-800 space-y-6"
                  >
                    {/* Routing line */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-emerald-400">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <span className="font-bold text-base">Audit complete — generating earnings projection...</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, ease: 'easeInOut' }}
                          style={{ transformOrigin: 'left' }}
                          className="h-full w-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Earnings Estimator Card */}
                    {(() => {
                      const trade       = getTradeData(industry);
                      const demandVol   = getDemandVolume(city, industry);
                      const isEmergency = /emergency|urgent|repair|damage|leak|freeze|burst/i.test(serviceType);
                      const ticket      = isEmergency ? trade.emergencyTicket : trade.avgTicket;

                      // 3 capture tiers
                      const tiers = [
                        { label: 'Conservative',  pct: 5,  color: 'text-slate-300',  bar: 'from-slate-600 to-slate-500',  bg: 'bg-slate-800/60',    border: 'border-slate-700' },
                        { label: 'Moderate',      pct: 15, color: 'text-blue-300',   bar: 'from-blue-700 to-blue-500',    bg: 'bg-blue-500/8',      border: 'border-blue-500/30' },
                        { label: 'Aggressive',    pct: 25, color: 'text-emerald-300',bar: 'from-emerald-700 to-emerald-500',bg:'bg-emerald-500/8',  border: 'border-emerald-500/30' },
                      ].map(t => ({
                        ...t,
                        calls:    Math.round(demandVol * (t.pct / 100)),
                        revenue:  Math.round(demandVol * (t.pct / 100)) * ticket,
                      }));

                      const planCost = 199; // Growth plan reference

                      return (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden"
                        >
                          {/* Header */}
                          <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <BarChart3 className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-display font-black text-white">
                                Your Earnings Projection — {city} {industry}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                              This week's demand window
                            </span>
                          </div>

                          <div className="p-6 space-y-5">
                            {/* Market context line */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-slate-400">
                              <span>
                                <span className="text-slate-500">Detected demand:</span>{' '}
                                <span className="text-white font-bold">{demandVol} active {industry.toLowerCase()} requests</span>
                                {' '}in {city} this week
                              </span>
                              <span>
                                <span className="text-slate-500">Avg ticket{isEmergency ? ' (emergency)' : ''}:</span>{' '}
                                <span className="text-white font-bold">${ticket.toLocaleString()}</span>
                              </span>
                            </div>

                            {/* 3 tier rows */}
                            <div className="space-y-3">
                              {tiers.map((tier, i) => (
                                <motion.div
                                  key={tier.label}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6 + i * 0.1 }}
                                  className={`flex items-center gap-4 p-4 ${tier.bg} border ${tier.border} rounded-xl`}
                                >
                                  {/* Pct badge */}
                                  <div className="w-14 text-center shrink-0">
                                    <div className={`text-lg font-display font-black ${tier.color}`}>{tier.pct}%</div>
                                    <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">capture</div>
                                  </div>

                                  {/* Bar */}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{tier.label}</span>
                                      <span className={`text-sm font-display font-black ${tier.color}`}>
                                        ${tier.revenue.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.7 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                        style={{ width: `${(tier.pct / 25) * 100}%`, transformOrigin: 'left' }}
                                        className={`h-full bg-gradient-to-r ${tier.bar} rounded-full`}
                                      />
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-600 mt-1">
                                      {tier.calls} {tier.calls === 1 ? 'job' : 'jobs'} × ${ticket.toLocaleString()} avg
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Subscription comparison */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.95 }}
                              className="flex items-center gap-3 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl"
                            >
                              <Zap className="h-4 w-4 text-blue-400 shrink-0" />
                              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                                <span className="text-white font-bold">Your Growth plan costs ${planCost}/mo.</span>
                                {' '}At the conservative capture rate, a single {trade.unit} covers{' '}
                                <span className="text-blue-300 font-bold">
                                  {Math.floor(tiers[0].revenue / planCost) > 0
                                    ? `${Math.floor(tiers[0].revenue / planCost)} months`
                                    : 'your full monthly subscription'}{' '}
                                </span>
                                of JobLeak — before the week is over.
                              </p>
                            </motion.div>

                            {/* CTA note */}
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                              <DollarSign className="h-3 w-3" />
                              Full earnings breakdown available in your Intelligence Dashboard
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> SSL Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="h-3 w-3" /> Open-Meteo · NWS · Reddit
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <Shield className="h-3 w-3" /> JobLeak Deep Market Audit™ v3.1
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-600">
                {terminalLines.length} / 19 operations
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              Deep Market Audit™ — Live Intelligence Engine
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white mb-6 leading-[1.05] tracking-tight"
          >
            Find Leads{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Before Competitors Do
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Configure your target market below. JobLeak analyzes weather anomalies, search intent velocity, and competitor density to surface high-urgency opportunities.
          </motion.p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Card header bar */}
          <div className="border-b border-slate-800 px-8 py-5 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Scan className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Market Configuration</div>
                <div className="text-slate-500 text-xs font-mono">Enter parameters to initialize scan</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE DATA
            </div>
          </div>

          <form onSubmit={handleScan} className="p-8 space-y-8">

            {/* Quick Presets */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3">
                  Quick Start Presets
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quickPresets.map((preset, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => applyPreset(preset)}
                    className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 rounded-xl transition-all text-left group"
                  >
                    <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors mb-1">
                      {preset.label}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {preset.city} · {preset.industry}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* State */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Target State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                  disabled={scanning}
                >
                  {StatesList.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Target City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                  disabled={scanning}
                >
                  {StatesList.find(s => s.code === selectedState)?.cities.map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Trade / Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                  disabled={scanning}
                >
                  <option value="HVAC">HVAC Services</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Roofing">Roofing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Pest Control">Pest Control</option>
                  <option value="Garage Door">Garage Door</option>
                </select>
              </div>

              {/* Service */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Primary Service
                </label>
                <input
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Emergency AC Repair"
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium placeholder:text-slate-600"
                  disabled={scanning}
                />
              </div>
            </div>

            {/* Submit */}
              {/* Gate banner — shown when free scan used and user isn't paid */}
              {!isPaidUser && freeScanUsed && (
                <div className="flex items-start gap-3 p-4 bg-orange-500/8 border border-orange-500/20 rounded-xl">
                  <Lock className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-300">Free scan already used</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Upgrade to Starter ($99/mo) for unlimited scans.{' '}
                      <button
                        type="button"
                        onClick={() => window.open(WHOP_STARTER, '_blank', 'noopener,noreferrer')}
                        className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                      >
                        Upgrade now
                      </button>
                    </p>
                  </div>
                </div>
              )}

              <motion.button
              type="submit"
              disabled={scanning}
              whileHover={!scanning ? { scale: 1.01 } : {}}
              whileTap={!scanning ? { scale: 0.99 } : {}}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-display font-black text-base uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative z-10 flex items-center gap-3">
                <Scan className="h-5 w-5" />
                Initialize Deep Market Audit™
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

          </form>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: CheckCircle, label: 'Live weather feeds via Open-Meteo' },
            { icon: Activity, label: 'AI-powered intent scoring' },
            { icon: TrendingUp, label: 'No credit card required' },
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <item.icon className="h-3.5 w-3.5 text-slate-600" />
              {item.label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
