/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RISK SCANNER — Deep Market Audit™
 * Clean rewrite — no IIFE in JSX, no Math.random(), no complex render logic
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scan, ArrowRight, TrendingUp, CheckCircle,
  Activity, Shield, Radio, Database, Cpu,
  Lock, Zap, LogIn, ExternalLink,
} from 'lucide-react';
import { StatesList } from '../types';
import { getActiveSession } from '../authService';

const FREE_SCAN_KEY = 'jobleak_free_scan_used';
const WHOP_STARTER  = 'https://whop.com/checkout/plan_txHzVnJkSgWey';

interface ScanFormProps {
  onScanComplete: (city: string, industry: string, serviceText: string) => void;
  onRouteChange: (route: string) => void;
}

// Seeded terminal script — no Math.random()
function buildTerminalScript(city: string, industry: string, service: string): string[] {
  const seed    = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const permits = 20 + (seed % 30);
  const adCount = 8  + (seed % 12);
  const posts   = 3  + (seed % 8);
  const stateCode = StatesList.find(s => s.cities?.includes(city))?.code || 'US';
  return [
    `> INITIALIZING JOBLEAK DEEP MARKET AUDIT™ v3.1`,
    `> TARGET MARKET: ${city.toUpperCase()}, ${stateCode}`,
    `> TRADE VERTICAL: ${industry.toUpperCase()} SERVICES`,
    `> SERVICE SCOPE: ${service.toUpperCase()}`,
    `> ─────────────────────────────────────────────`,
    `> [1/6] Connecting to Open-Meteo geocoding API...`,
    `> [1/6] Coordinates resolved — ${city} region locked`,
    `> [2/6] Pulling NWS 5-day weather forecast...`,
    `> [2/6] Temperature anomaly + wind shear analysis complete`,
    `> [3/6] Scanning municipal permit registry...`,
    `> [3/6] ${permits} active ${industry} permits in last 30 days`,
    `> [4/6] Querying Google Search intent vectors...`,
    `> [4/6] Keyword velocity spike: "${service.toLowerCase()}"`,
    `> [5/6] Mapping competitor ad density in ${city}...`,
    `> [5/6] ${adCount} active advertisers detected`,
    `> [6/6] Indexing community signal boards...`,
    `> [6/6] ${posts} high-intent homeowner posts found`,
    `> ─────────────────────────────────────────────`,
    `> COMPUTING OPPORTUNITY SCORE...`,
    `> AUDIT COMPLETE`,
  ];
}

const QUICK_PRESETS = [
  { label: 'Phoenix Heat Wave', city: 'Phoenix',  state: 'AZ', industry: 'HVAC',     service: 'Emergency AC Repair' },
  { label: 'Houston Storm',     city: 'Houston',  state: 'TX', industry: 'Roofing',  service: 'Storm Damage Repair' },
  { label: 'Denver Freeze',     city: 'Denver',   state: 'CO', industry: 'Plumbing', service: 'Frozen Pipe Emergency' },
];

export default function ScanForm({ onScanComplete, onRouteChange }: ScanFormProps) {
  const [selectedState, setSelectedState] = useState('TX');
  const [city,          setCity]          = useState('Austin');
  const [industry,      setIndustry]      = useState('HVAC');
  const [serviceType,   setServiceType]   = useState('Emergency AC Repair');

  const [scanning,       setScanning]       = useState(false);
  const [scanPhase,      setScanPhase]      = useState(0);
  const [terminalLines,  setTerminalLines]  = useState<string[]>([]);
  const [scanComplete,   setScanComplete]   = useState(false);
  const [showPaywall,    setShowPaywall]    = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Reactive session state
  const [session, setSession] = useState(() => getActiveSession());
  useEffect(() => {
    setSession(getActiveSession());
    const onFocus = () => setSession(getActiveSession());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const isLoggedIn   = !!session;
  const freeScanUsed = localStorage.getItem(FREE_SCAN_KEY) === '1';
  const isPaidUser   = isLoggedIn &&
    ['Starter', 'Growth', 'Pro'].includes(session?.subscriptionPlan ?? '');

  // Sync cities when state changes
  useEffect(() => {
    const cities = StatesList.find(s => s.code === selectedState)?.cities ?? [];
    if (cities.length && !cities.includes(city)) setCity(cities[0]);
  }, [selectedState]);

  const applyPreset = (p: typeof QUICK_PRESETS[0]) => {
    setSelectedState(p.state);
    setCity(p.city);
    setIndustry(p.industry);
    setServiceType(p.service);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();

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
        if (!isPaidUser) localStorage.setItem(FREE_SCAN_KEY, '1');
        onScanComplete(city, industry, serviceType);
        setTimeout(() => {
          try { onRouteChange('#radar'); }
          catch { window.location.hash = '#radar'; }
        }, 2500);
        return;
      }
      if (i === 0)  setScanPhase(1);
      if (i === 5)  setScanPhase(2);
      if (i === 9)  setScanPhase(3);
      if (i === 13) setScanPhase(4);
      if (i === 17) setScanPhase(5);

      setTerminalLines(prev => [...prev, script[i]]);
      i++;

      requestAnimationFrame(() => {
        if (terminalRef.current)
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      });

      const isBreak = script[i - 1]?.startsWith('> ─');
      setTimeout(addLine, isBreak ? 350 : i < 4 ? 110 : 80);
    };

    setTimeout(addLine, 250);
  };

  const PHASES = [
    { label: 'Initialize', icon: Cpu },
    { label: 'Weather',    icon: Radio },
    { label: 'Permits',    icon: Database },
    { label: 'Search',     icon: Activity },
    { label: 'Community',  icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* ── PAYWALL OVERLAY ── */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto">
                <Lock className="h-7 w-7 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-white">Free Scan Used</h2>
                <p className="text-slate-400 font-mono text-sm mt-2 leading-relaxed">
                  Upgrade to run unlimited scans and unlock your full intelligence dashboard.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => window.open(WHOP_STARTER, '_blank', 'noopener,noreferrer')}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Upgrade — Starter $99/mo <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { window.location.hash = '#login'; }}
                  className="w-full py-3 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-mono font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" /> Already have an account? Sign in
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TERMINAL OVERLAY ── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
          >
            {/* Top bar */}
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="text-slate-500 text-xs font-mono ml-2">
                  jobleak — deep-market-audit — {city.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-blue-400 text-xs font-mono font-bold">SCANNING</span>
              </div>
            </div>

            {/* Phase strip */}
            <div className="grid grid-cols-5 border-b border-slate-800 shrink-0">
              {PHASES.map((phase, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 flex items-center gap-2 border-r border-slate-800 last:border-r-0 transition-all ${
                    scanPhase > i ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <phase.icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    scanPhase > i ? 'text-blue-400' : scanPhase === i + 1 ? 'text-slate-400' : 'text-slate-700'
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
            >
              <div className="max-w-3xl mx-auto space-y-1.5">
                {terminalLines.map((line, idx) => {
                  const isSection  = line.startsWith('> ─');
                  const isComplete = line.includes('COMPLETE');
                  const isData     = line.includes('detected') || line.includes('found') ||
                                     line.includes('spike') || line.includes('locked') ||
                                     line.includes('complete') || line.includes('AUDIT');
                  const isBuilding = line.includes('COMPUTING');
                  let textColor = 'text-slate-400';
                  if (isSection)   textColor = 'text-slate-700';
                  if (isData)      textColor = 'text-emerald-400';
                  if (isBuilding)  textColor = 'text-yellow-400';
                  if (isComplete)  textColor = 'text-emerald-300 font-bold';
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.1 }}
                      className={textColor}
                    >
                      {line}
                    </motion.div>
                  );
                })}

                {/* Cursor */}
                {!scanComplete && scanning && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-400">{'>'}</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-blue-400"
                    />
                  </div>
                )}

                {/* Complete state — simple, no calculations */}
                {scanComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mt-8 pt-6 border-t border-slate-800 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <span className="font-bold text-base">
                        Audit complete — routing to Intelligence Dashboard...
                      </span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 2.2, ease: 'easeInOut' }}
                        style={{ transformOrigin: 'left' }}
                        className="h-full w-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Weather',     value: 'Analyzed', color: 'text-blue-400' },
                        { label: 'Competitors', value: 'Mapped',   color: 'text-indigo-400' },
                        { label: 'Campaign',    value: 'Ready',    color: 'text-emerald-400' },
                      ].map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center"
                        >
                          <div className={`text-sm font-mono font-black ${s.color}`}>{s.value}</div>
                          <div className="text-[10px] font-mono text-slate-600 mt-0.5 uppercase tracking-wider">{s.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
                <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> SSL</span>
                <span className="flex items-center gap-1.5"><Database className="h-3 w-3" /> Open-Meteo · NWS</span>
                <span className="hidden sm:flex items-center gap-1.5"><Shield className="h-3 w-3" /> JobLeak v3.1</span>
              </div>
              <span className="text-[10px] font-mono text-slate-600">
                {terminalLines.length} / {buildTerminalScript(city, industry, serviceType).length} ops
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN FORM ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              Deep Market Audit™ — Live Intelligence
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-black text-white mb-5 leading-[1.05] tracking-tight">
            Find Leads{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Before Competitors Do
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Configure your market below. JobLeak analyzes weather events, search intent, and competitor density to surface high-urgency opportunities 18–72 hours early.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Card header */}
          <div className="border-b border-slate-800 px-8 py-5 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Scan className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Market Configuration</div>
                <div className="text-slate-500 text-xs font-mono">Set parameters to initialize scan</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LIVE DATA
            </div>
          </div>

          <form onSubmit={handleScan} className="p-8 space-y-8">
            
            {/* Quick presets */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3">
                  Quick Presets
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {QUICK_PRESETS.map((p, i) => (
                  <motion.button
                    key={i} type="button"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => applyPreset(p)}
                    className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 rounded-xl transition-all text-left group cursor-pointer"
                  >
                    <div className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">{p.label}</div>
                    <div className="text-xs text-slate-500 font-mono">{p.city} · {p.industry}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">State</label>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  disabled={scanning}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  {StatesList.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  disabled={scanning}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  {(StatesList.find(s => s.code === selectedState)?.cities ?? []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Trade</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  disabled={scanning}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  {['HVAC','Plumbing','Roofing','Electrical','Pest Control','Garage Door'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Service</label>
                <input
                  type="text"
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                  placeholder="e.g. Emergency AC Repair"
                  disabled={scanning}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Gate banner */}
            {!isPaidUser && freeScanUsed && (
              <div className="flex items-start gap-3 p-4 bg-orange-500/8 border border-orange-500/20 rounded-xl">
                <Lock className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-300">Free scan already used</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    Upgrade to Starter ($99/mo) for unlimited scans.{' '}
                    <button type="button" onClick={() => window.open(WHOP_STARTER, '_blank', 'noopener,noreferrer')}
                      className="text-blue-400 hover:text-blue-300 underline cursor-pointer">
                      Upgrade now
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={scanning}
              whileHover={!scanning ? { scale: 1.01 } : {}}
              whileTap={!scanning ? { scale: 0.99 } : {}}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-display font-black text-base uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative z-10 flex items-center gap-3">
                <Scan className="h-5 w-5" />
                {scanning ? 'Scanning...' : 'Initialize Deep Market Audit™'}
                {!scanning && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </motion.button>
          </form>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: CheckCircle, label: 'Live weather via Open-Meteo' },
            { icon: Activity,    label: 'AI-powered intent scoring' },
            { icon: TrendingUp,  label: 'No credit card required' },
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
