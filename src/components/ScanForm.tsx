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
  Lock
} from 'lucide-react';
import { StatesList } from '../types';

interface ScanFormProps {
  onScanComplete: (city: string, industry: string, serviceText: string) => void;
  onRouteChange: (route: string) => void;
}

export default function ScanForm({ onScanComplete, onRouteChange }: ScanFormProps) {
  // SIMPLIFIED: Only 3 core fields
  const [selectedState, setSelectedState] = useState('TX');
  const [city, setCity] = useState('Austin');
  const [industry, setIndustry] = useState('HVAC');
  const [serviceType, setServiceType] = useState('Emergency AC Repair');
  
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

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
    setScanning(true);
    setScanPhase(0);
    setTerminalLines([]);
    setScanComplete(false);

    const script = buildTerminalScript(city, industry, serviceType);
    let i = 0;

    const addLine = () => {
      if (i >= script.length) {
        setScanComplete(true);
        setTimeout(() => {
          onScanComplete(city, industry, serviceType);
          window.location.hash = '#radar';
          onRouteChange('#radar');
        }, 900);
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

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

                {/* Complete state */}
                {scanComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-6 pt-6 border-t border-slate-800"
                  >
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-bold text-base">Audit complete — routing to Intelligence Dashboard...</span>
                    </div>
                    <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      />
                    </div>
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
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
          animate={{ opacity: 1, scale: 1 }}
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
