/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Radio, 
  Layers, 
  MapPin, 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CloudSun, 
  AlertCircle, 
  Calculator,
  Search,
  BookOpen,
  Activity,
  DollarSign,
  Star,
  ArrowUpRight,
  MessageSquare,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { MarketProfiles, calculateSearchIntentScore, getMarketProfile } from '../types';

interface HomepageProps {
  onStartInstantScan: (city: string, industry: string, serviceText: string) => void;
  onRouteChange: (route: string) => void;
}

export default function Homepage({ onStartInstantScan, onRouteChange }: HomepageProps) {
  // Local state for the interactive previewer on the landing page
  const [previewCity, setPreviewCity] = useState('Austin');
  const [previewIndustry, setPreviewIndustry] = useState('HVAC');
  const [serviceText, setServiceText] = useState('Emergency AC repair and compressor blowouts');

  // Interactive ROI Calculator States
  const [calcIndustry, setCalcIndustry] = useState<string>('HVAC');
  const [calcJobValue, setCalcJobValue] = useState<number>(5505);
  const [calcMonthlyJobs, setCalcMonthlyJobs] = useState<number>(3);
  const [calcAdBudget, setCalcAdBudget] = useState<number>(1800);

  // Auto-adjust ticket values on trade change for realistic default numbers
  const handleCalcIndustryChange = (indItem: string) => {
    setCalcIndustry(indItem);
    if (indItem === 'HVAC') { setCalcJobValue(5500); setCalcMonthlyJobs(3); }
    else if (indItem === 'Roofing') { setCalcJobValue(9500); setCalcMonthlyJobs(2); }
    else if (indItem === 'Plumbing') { setCalcJobValue(2800); setCalcMonthlyJobs(4); }
    else if (indItem === 'Electrical') { setCalcJobValue(1805); setCalcMonthlyJobs(4); }
    else { setCalcJobValue(1200); setCalcMonthlyJobs(5); }
  };

  // Compute live scores for the hero mockup
  const previewProfile = getMarketProfile(previewCity);
  const { score: previewIntentScore, competition, cpcTier } = calculateSearchIntentScore(previewCity, serviceText, previewIndustry);

  const handleQuickPrebuiltScan = (city: string, industry: string, service: string) => {
    onStartInstantScan(city, industry, service);
  };

  const industriesList = [
    { name: 'HVAC', description: 'Detects triple-digit temperatures & sub-zero furnace failures.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { name: 'Roofing', description: 'Triggers on wind speeds >= 35mph, hail damage & heavy downpours.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Plumbing', description: 'Active alerts for frozen pipes (<= 28°F) & storm drain pressures.', color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { name: 'Electrical', description: 'Monitors NWS storm outages, transformer strikes & grid overloads.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { name: 'Pest Control', description: 'Identifies high breeding swarms from humidity spikes and heat.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Garage Door', description: 'Scans for wind-damaged panels, spring replacements and structural impact.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div id="homepage-root" className="min-h-screen text-slate-800 selection:bg-blue-650 selection:bg-blue-600 selection:text-white relative">
      
      {/* 1. HERO SECTION WITH DEEP NAVY RAMP FRAME */}
      <section className="relative overflow-hidden pt-24 pb-28 border-b border-slate-200/80">
        {/* Subtle radial glow blobs for ultimate SaaS depth */}
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full blue-glow-blob pointer-events-none z-0" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full indigo-glow-blob pointer-events-none z-0" />
        
        {/* Grid lines background overlay */}
        <div className="absolute inset-0 opacity-[0.45] pointer-events-none saas-grid-bg" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left pitch copy - with Framer Motion reveal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-7"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50/70 border border-blue-200 px-3.5 py-1 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
                  Contractor Intelligence Platform
                </span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight leading-none text-slate-900">
                  Find local contractor jobs <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 font-extrabold">
                    before your competitors do.
                  </span>
                </h1>
                
                <p className="text-base sm:text-md text-slate-650 text-slate-600 leading-relaxed font-sans max-w-2xl">
                  We parse live weather anomalies, municipal permit activity, and search volume surges to forecast high-urgency services. Lock in exclusive HVAC, plumbing, or roofing leads ahead of local bid wars.
                </p>
              </div>

              {/* Instant action triggers */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                <motion.button
                  id="hero-cta-scan"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onRouteChange('#scan'); window.location.hash = '#scan'; }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold rounded-xl shadow-2xl transition-all flex items-center justify-center space-x-2 border border-transparent hover:border-blue-400/50 cursor-pointer text-sm"
                >
                  <span>Build Free Market Scan</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  id="hero-cta-demo"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const scrollTarget = document.getElementById('demo-interactive-previewer');
                    if (scrollTarget) {
                      scrollTarget.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 bg-white border border-slate-300 text-slate-700 hover:text-slate-905 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm font-semibold shadow-sm"
                >
                  <span>Interactive Real-time Sandbox</span>
                </motion.button>
              </div>

              {/* High-fidelity signal bullet points */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6 max-w-xl">
                <div className="flex items-center space-x-2.5 text-slate-500 text-[10px] font-mono font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded bg-blue-500" />
                  <span>LIVE GEOLOCATIONAL PARSES</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-500 text-[10px] font-mono font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded bg-indigo-500" />
                  <span>NWS SEVERE INCIDENT RADAR</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-500 text-[10px] font-mono font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded bg-sky-500" />
                  <span>ALGORITHMIC INTENT ESTIMATION</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-500 text-[10px] font-mono font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded bg-emerald-505 bg-emerald-500 tracking-wide" />
                  <span>READY-TO-LAUNCH CAMPAIGNS</span>
                </div>
              </div>
            </motion.div>

            {/* Right container - Polished interactive dashboard mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative mt-6 lg:mt-0"
            >
              {/* Central Mockup Panel Container */}
              <div className="bento-card-dark rounded-2xl p-6 relative overflow-hidden backdrop-blur-md border border-white/15">
                {/* Radial gradient overlay inside panel */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/5 via-transparent to-transparent pointer-events-none" />
                
                {/* Header elements of the mock preview panel */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h4 className="text-white text-[10px] font-mono tracking-wider font-bold">DIAGNOSTIC ALGORITHM</h4>
                      <p className="text-[9px] text-slate-400 leading-none">Live Calculators & Search Intent</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-slate-900 border border-white/10 text-slate-300 font-mono tracking-widest">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Selectors inside preview to make it feel extremely interactive */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[9px] font-bold tracking-wider">SELECT REGION</label>
                      <select 
                        id="hero-preview-city-select"
                        value={previewCity} 
                        onChange={(e) => setPreviewCity(e.target.value)} 
                        className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-[10px]"
                      >
                        {Object.keys(MarketProfiles).map(key => (
                          <option key={key} value={MarketProfiles[key].name} className="bg-slate-950 text-white">
                            {MarketProfiles[key].name} (+{MarketProfiles[key].growth}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-mono text-[9px] font-bold tracking-wider">SELECT TRADE</label>
                      <select 
                        id="hero-preview-industry-select"
                        value={previewIndustry} 
                        onChange={(e) => setPreviewIndustry(e.target.value)} 
                        className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-[10px]"
                      >
                        <option value="HVAC" className="bg-slate-950">HVAC</option>
                        <option value="Roofing" className="bg-slate-950">Roofing</option>
                        <option value="Plumbing" className="bg-slate-950">Plumbing</option>
                        <option value="Electrical" className="bg-slate-950">Electrical</option>
                        <option value="Pest Control" className="bg-slate-950">Pest Control</option>
                        <option value="Garage Door" className="bg-slate-950">Garage Door</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[9px] font-bold tracking-wider">TARGET SERVICES FOCUS</label>
                    <input 
                      id="hero-preview-service-input"
                      type="text" 
                      value={serviceText}
                      onChange={(e) => setServiceText(e.target.value)}
                      placeholder="e.g. frozen AC pipe water repair"
                      className="w-full bg-slate-950/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Calculated metrics section using calculated intent scores */}
                  <div className="bg-slate-950/90 p-3.5 rounded-xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider">ESTIMATED SIGNAL INDEX:</span>
                      <span className="text-lg font-display font-bold text-blue-400 font-mono">
                        {previewIntentScore} <span className="text-xs text-slate-500">/ 95</span>
                      </span>
                    </div>
                    
                    <div className="mt-2.5 space-y-1.5 text-[9px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Area Compound Growth:</span>
                        <span className="text-slate-200 font-bold">+{previewProfile.growth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Permit Velocity Index:</span>
                        <span className="text-slate-200">{previewProfile.permitHeat} Units / 30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CPC Pricing Stress:</span>
                        <span className={`font-semibold ${cpcTier === 'High' ? 'text-orange-400' : 'text-blue-400'}`}>
                          {cpcTier} Cost Level
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ad Competitor Density:</span>
                        <span className={`font-semibold ${competition === 'High' ? 'text-red-400' : competition === 'Medium' ? 'text-orange-400' : 'text-green-400'}`}>
                          {competition} Density
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trigger scanner button */}
                  <motion.button 
                    id="hero-preview-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleQuickPrebuiltScan(previewCity, previewIndustry, serviceText)}
                    className="w-full py-3 bg-blue-600 font-display font-medium text-xs uppercase tracking-widest text-white hover:bg-blue-500 transition-all rounded-xl shadow-lg flex items-center justify-center space-x-2 border border-transparent hover:border-blue-400/50 cursor-pointer"
                  >
                    <span>Instant Live Search Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Clean Indicators Console directly under the main box - fully polished & touch responsive */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                
                {/* 1. Live Pulse Diagnostic Indicator */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-300">Live Pulse</span>
                    </div>
                    <Radio className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">High Urgency Event Registered</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Spike monitored in {previewCity}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1.5 rounded border border-emerald-900/10">
                    <span>{previewIndustry} Alert</span>
                    <span>94/95</span>
                  </div>
                </div>

                {/* 2. Saved Marketing Waste Indicator */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Saved Waste</span>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-955/50 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">$2,480</span>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-bold text-white leading-snug">Broad Keyword Waste Prevented</p>
                  </div>
                  {/* Miniature Bar Chart (Static, crisp, perfectly polished) */}
                  <div className="flex items-end space-x-1.5 h-8 pt-1">
                    <div className="flex-1 bg-slate-850 bg-slate-800 rounded-sm h-[30%] text-[1px]" />
                    <div className="flex-1 bg-slate-850 bg-slate-800 rounded-sm h-[45%] text-[1px]" />
                    <div className="flex-1 bg-slate-800 bg-slate-705 rounded-sm h-[60%] text-[1px]" />
                    <div className="flex-1 bg-blue-600 rounded-sm h-[80%] text-[1px]" />
                    <div className="flex-1 bg-indigo-600 rounded-sm h-[100%] text-[1px]" />
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS STRIP WITH METADATA COUNTERS */}
      <section className="bg-white/90 text-slate-850 text-slate-850 py-10 border-t border-b border-slate-200/80 backdrop-blur-md relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-2 space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-blue-600 tracking-tight">142,842</p>
              <p className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">Live Ingestion Feeds</p>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">418</p>
              <p className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">NWS Alert Connections</p>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-blue-700 tracking-tight">98.4%</p>
              <p className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">Accuracy Validation</p>
            </div>
            <div className="p-2 space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-orange-600 tracking-tight">$3.4K/mo</p>
              <p className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">Avg Saved Ad Waste</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND VALUE AND STRATEGIC REVENUE ENHANCEMENT SUITE */}
      <section className="py-20 border-b border-slate-200/80 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blue-glow-blob pointer-events-none opacity-40 z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="h-3 w-3 mr-1 text-blue-600 animate-spin" /> Corporate Strategy Dashboard
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-slate-900">
              Why JobLeak Wins & How We Generate Extreme Value
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              We intercept high-ticket, high-urgency homeowner searches matching severe weather trigger incidents. Instead of paying high ad agency retainer fees for shared lead pools, you secure direct regional exclusivity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: INTERACTIVE CONTRACTOR PROFIT COUNTER / CALCULATOR */}
            <div className="lg:col-span-6 bento-card p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center space-x-2.5 border-b border-slate-200 pb-4 mb-4">
                  <span className="p-2 bg-blue-50 border border-blue-200 text-blue-650 text-blue-600 rounded-lg">
                    <Calculator className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-medium text-slate-900 text-base">Corporate Growth & Profit Leverage Modeler</h3>
                    <p className="text-xs text-slate-500">Adjust parameters below to model exclusive climate lead yield</p>
                  </div>
                </div>

                <div className="space-y-5 text-sm">
                  {/* Select Trade Block */}
                  <div>
                    <span className="block text-slate-700 mb-1.5 font-mono text-xs font-bold tracking-wider uppercase">1. Select Target Trade Sector</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['HVAC', 'Roofing', 'Plumbing'].map((tType) => (
                        <button
                          key={tType}
                          type="button"
                          onClick={() => handleCalcIndustryChange(tType)}
                          className={`py-2 px-2.5 rounded-lg border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                            calcIndustry === tType 
                              ? 'bg-blue-600 border-blue-550 text-white shadow-md' 
                              : 'bg-slate-50 border-slate-200 text-slate-655 text-slate-650 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {tType}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range slider for average work ticket value */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-slate-705 text-slate-700 font-mono font-bold tracking-wider uppercase">2. Average Ticket Value (ACV)</span>
                      <span className="font-mono font-extrabold text-blue-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded text-xs">${calcJobValue.toLocaleString()} per job</span>
                    </div>
                    <input 
                      type="range" 
                      min={calcIndustry === 'Roofing' ? 3000 : calcIndustry === 'HVAC' ? 1500 : 500} 
                      max={calcIndustry === 'Roofing' ? 20000 : calcIndustry === 'HVAC' ? 12000 : 8000} 
                      step={250}
                      value={calcJobValue}
                      onChange={(e) => setCalcJobValue(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-bold">
                      <span>Low Complex</span>
                      <span>High Ticket Retrofit</span>
                    </div>
                  </div>

                  {/* Monthly Trigger Jobs Landed slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-slate-705 text-slate-700 font-mono font-bold tracking-wider uppercase">3. Converted Exclusive Jobs / Month</span>
                      <span className="font-mono font-extrabold text-orange-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded text-xs">{calcMonthlyJobs} Confirmed Deals</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      step="1"
                      value={calcMonthlyJobs}
                      onChange={(e) => setCalcMonthlyJobs(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-bold">
                      <span>1 Job / mo</span>
                      <span>15 Jobs / mo</span>
                    </div>
                  </div>

                  {/* Waste budget slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-slate-200 font-mono font-bold tracking-wider uppercase">4. Salvaged CPC Marketing Waste</span>
                      <span className="font-mono font-extrabold text-teal-300 bg-slate-950 border border-white/10 px-2.5 py-0.5 rounded text-xs">${calcAdBudget.toLocaleString()} / mo</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="5000" 
                      step="100"
                      value={calcAdBudget}
                      onChange={(e) => setCalcAdBudget(Number(e.target.value))}
                      className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>$100 Ad Waste</span>
                      <span>$5,000 Saved Agency Cost</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOPAMINE MATH RESULTS GRID */}
              <div className="bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-800 space-y-4 mt-4 shadow-xl relative">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-305 text-slate-300 font-mono text-[10px] uppercase font-bold tracking-wider block">Projected Revenue Expansion / Mo</span>
                    <span className="text-2xl sm:text-3xl font-display font-black text-emerald-405 text-emerald-400 tracking-tight font-mono">
                      +${(calcJobValue * calcMonthlyJobs).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-305 text-slate-300 font-mono text-[10px] uppercase font-bold tracking-wider block">Yearly Net Business Gain</span>
                    <span className="text-2xl sm:text-3xl font-display font-black text-blue-400 tracking-tight font-mono">
                      +${((calcJobValue * calcMonthlyJobs * 12) + (calcAdBudget * 12)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>Calculated Return Margin: <b className="text-white font-mono">{( ((calcJobValue * calcMonthlyJobs * 12) + (calcAdBudget * 12)) / 2388 * 100 ).toFixed(0)}% ROI</b></span>
                  </div>
                  
                  <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/65 border border-indigo-900/40 px-2 py-0.5 rounded select-none">
                    *Based on $199/mo standard access cost
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: WHY JOBLEAK WINS & HOW WE WORK */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              {/* SIDE-BY-SIDE MODEL COMPARE */}
              <div className="bento-card p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest mb-2">Architectural Comparison</h3>
                  <h4 className="text-xl font-display font-semibold text-slate-900 leading-snug">
                    Why We are the Best: Real Exclusive Intercepts
                  </h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Unlike standard agencies that sell the exact same lead record to multiple competitors simultaneously, creating a quick race-to-the-bottom price war, JobLeak grants complete structural exclusivity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans mt-3">
                  {/* The Old Wasteful Way */}
                  <div className="p-4 bg-red-50/70 rounded-xl border border-red-200 space-y-3">
                    <div className="flex items-center justify-between text-red-650 text-red-700 font-bold font-mono text-[10px]">
                      <span>TRADITIONAL SHARED AGENCIES</span>
                      <span className="text-[9px] bg-red-105 bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">WASTEFUL</span>
                    </div>
                    <ul className="space-y-2 text-slate-655 text-slate-600 leading-normal text-[11px]">
                      <li className="flex items-start space-x-1.5">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>$120+ high-competition lead fees</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>Splits leads across 4 to 5 HVAC shops</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>Often 24 to 48 hour massive lags</span>
                      </li>
                    </ul>
                  </div>

                  {/* The Premium JobLeak Way */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 relative shadow-inner overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg" />
                    <div className="flex items-center justify-between text-emerald-650 text-emerald-700 font-bold font-mono text-[10px]">
                      <span>THE EXCLUSIVE JOBLEAK METRIC</span>
                      <span className="text-[9px] bg-emerald-105 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-250 border-emerald-200 font-bold whitespace-nowrap">100% EXCLUSIVE</span>
                    </div>
                    <ul className="space-y-2 text-slate-655 text-slate-650 leading-normal text-[11px]">
                      <li className="flex items-start space-x-1.5">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Flat rate index access; pay zero lead fees</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Exclusive geolocated climate triggers</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Live warnings update under 2 seconds</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* THREE REVEALING PIPELINE NODES (HOW WE WORK) */}
              <div className="bento-card p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">How We Work</h3>
                <h4 className="text-base font-display font-semibold text-slate-900">
                  Three simple steps of climate coordination:
                </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                  <div className="space-y-1">
                    <b className="font-mono text-blue-600 block font-black text-xs">01 // TRACK METRIC SPIKES</b>
                    <p className="text-slate-600 text-[11px] leading-relaxed">We continuously poll public Open-Meteo & National Weather Service parameters for temperature strain and wind shifts.</p>
                  </div>
                  <div className="space-y-1">
                    <b className="font-mono text-indigo-650 text-indigo-600 block font-black text-xs">02 // SCORE THE DEMAND</b>
                    <p className="text-slate-600 text-[11px] leading-relaxed">Our system isolates emergency buyers from home DIY-ers, checking localized cost-per-click CPC pressure indices.</p>
                  </div>
                  <div className="space-y-1">
                    <b className="font-mono text-blue-700 block font-black text-xs">03 // INJECT OUTBOUND</b>
                    <p className="text-slate-600 text-[11px] leading-relaxed">You instantly copy pre-scraped, highest-efficiency keywords & outbound sms blocks to absorb immediate customer flow.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE ONE-CLICK PREBUILT MARKETS SCAN */}
      <section className="py-20 relative z-10" id="demo-interactive-previewer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
              No Cold Starts
            </h2>
            <h3 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-slate-900">
              Execute Pre-Calculated Sample Scans
            </h3>
            <p className="text-slate-655 text-slate-600 text-sm leading-relaxed font-sans">
              Skip typing and click any of our live metro presets. Our engine immediately queries weather data, matches local rules, and populates the opportunity radar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { city: 'Phoenix', industry: 'HVAC', svc: 'Emergency compressor failure thermal checkup', tag: '100°F+ Peak Heat' },
              { city: 'Austin', industry: 'Plumbing', svc: 'Burst pipeline check and freeze mitigation', tag: 'Pipe Hard Freeze' },
              { city: 'Dallas', industry: 'Electrical', svc: 'Post storm outage generator hookup', tag: 'NWS Storm Danger' },
              { city: 'Tampa', industry: 'Roofing', svc: 'High wind damage shingle leak inspection', tag: 'Storm Wind (45mph)' },
              { city: 'Denver', industry: 'Garage Door', svc: 'Ice jammed door panel spring replacement', tag: 'Severe Freeze' },
            ].map((sample, idx) => (
              <motion.button
                key={idx}
                id={`sample-scan-btn-${sample.city.toLowerCase()}`}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPrebuiltScan(sample.city, sample.industry, sample.svc)}
                className="bento-card group p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer flex flex-col justify-between h-56"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[9px] font-mono font-bold rounded uppercase tracking-wider">
                      {sample.industry}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 font-bold">
                      {sample.tag}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-display font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {sample.city}
                  </h4>
                  
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2 italic font-bold">
                    "{sample.svc}"
                  </p>
                </div>

                <div className="mt-4 flex items-center text-[10px] font-mono font-bold text-blue-600 group-hover:text-blue-700 pt-3 border-t border-slate-250 border-slate-205 border-slate-200/80 transition-colors">
                  <span>Simulate Signal Scan</span>
                  <ArrowRight className="h-3 w-3 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW: DETECT -> PRIORITIZE -> WIN */}
      <section className="py-20 border-t border-b border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
              The Scientific Contractor Blueprint
            </h2>
            <h3 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-slate-900">
              Three Steps of Local Dominance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -4 }}
              className="bento-card p-8 relative"
            >
              <div className="absolute -top-4 left-6 bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-lg">
                01
              </div>
              <div className="h-10 w-10 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center mb-6 mt-2">
                <CloudSun className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-display font-semibold text-slate-900">Detect Signal Spikes</h4>
              <p className="text-slate-600 text-xs leading-relaxed mt-3 font-semibold">
                Our core engine checks real-time geocoded coordinates, scraping multi-day weather fluctuations (Meteo APIs) and emergency warnings (National Weather Service).
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bento-card p-8 relative"
            >
              <div className="absolute -top-4 left-6 bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-lg">
                02
              </div>
              <div className="h-10 w-10 text-indigo-600 bg-indigo-50 border border-indigo-205 border-indigo-200 rounded-xl flex items-center justify-center mb-6 mt-2">
                <Calculator className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-display font-semibold text-slate-900">Prioritize Channels</h4>
              <p className="text-slate-600 text-xs leading-relaxed mt-3 font-semibold">
                Calculates live Google Search, local LSA bidding ranges, and reactivation priority totals based on extreme heatwave, storm cell pressure, and market density constants.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bento-card p-8 relative"
            >
              <div className="absolute -top-4 left-6 bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shadow-lg">
                03
              </div>
              <div className="h-10 w-10 text-blue-700 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center mb-6 mt-2">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-display font-semibold text-slate-900">Win Urgent Business</h4>
              <p className="text-slate-600 text-xs leading-relaxed mt-3 font-semibold">
                Instantly generates fully written keyword lists, non-DIY negative keyword structures, radius rules, phone response grids, and ready-to-copy client text templates.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. INDUSTRY TILES GRID */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
              Supported Trades
            </h2>
            <h3 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-slate-900">
              Engineered Weather Trigger Sets
            </h3>
            <p className="text-slate-655 text-slate-600 text-sm mt-3 leading-relaxed">
              Each trade responds to tailored environmental thresholds. Customize and scan metrics to immediately trigger regional outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industriesList.map((ind, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }}
                className="bento-card p-6 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className={`p-2.5 rounded-lg w-max mb-4 ${ind.bg} border border-[#ffffff08]`}>
                    <Cpu className={`h-6 w-6 ${ind.color}`} />
                  </div>
                  <h4 className="text-lg font-display font-semibold text-slate-900">{ind.name}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ind.description}</p>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Verified Trigger Set</span>
                  </span>
                  <button 
                    id={`ind-run-scan-${ind.name.toLowerCase().replace(' ', '-')}--v1`}
                    onClick={() => handleQuickPrebuiltScan('Phoenix', ind.name, 'Emergency immediate reactive repair demand')}
                    className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center cursor-pointer"
                  >
                    <span>Run Scan</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COUPLING CHANNELS AND COURIER CAPABILITIES (SIGNAL SOURCES) */}
      <section className="py-20 border-b border-slate-200/80 relative z-10">
        <div className="absolute inset-x-0 bottom-0 top-0 opacity-[0.25] pointer-events-none saas-grid-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Explaining live vs configurable badges */}
            <div className="lg:col-span-5 space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
                Diagnostic Pipeline Overview
              </h3>
              <h4 className="text-3xl font-display font-medium text-slate-900 tracking-tight leading-tighter">
                Integrations Labeled with Verification Status
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-sans">
                True contractor intelligence requires coupling multiple separate layers. We verify connectivity status clearly in our user interface so you're always aware of core API statuses.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-mono font-bold uppercase tracking-widest rounded border border-emerald-200 mt-0.5">
                    Live Status
                  </span>
                  <div className="space-y-0.5">
                    <h5 className="font-display font-semibold text-xs text-slate-900">Geolocations & Weather forecasts</h5>
                    <p className="text-[11px] text-slate-600">Queries real-time Open-Meteo REST service endpoints on demand, matching historical thresholds instantly.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-mono font-bold uppercase tracking-widest rounded border border-blue-200 mt-0.5">
                    Live Status
                  </span>
                  <div className="space-y-0.5">
                    <h5 className="font-display font-semibold text-xs text-slate-900">NWS Direct Active Hazards</h5>
                    <p className="text-[11px] text-slate-600">Polls active storms, wildfires, hard freeze forecasts, and tornado radar directly from official weather.gov coordinates.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-mono font-bold uppercase tracking-widest rounded border border-amber-200 mt-0.5">
                    Configurable
                  </span>
                  <div className="space-y-0.5">
                    <h5 className="font-display font-semibold text-xs text-slate-900">SAM.gov Federal Contracting Bid Opportunities</h5>
                    <p className="text-[11px] text-slate-600">Activate via user secrets configuration to fetch bidding opportunities on local schools and buildings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side representation visualizer card */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <h5 className="font-mono text-[10px] text-blue-600 uppercase tracking-widest font-bold mb-6 flex items-center space-x-1.5">
                <Activity className="h-4 w-4 animate-pulse" />
                <span>Interactive Signal Flow Diagnostic</span>
              </h5>
              
              <div className="space-y-6 relative">
                <div className="absolute top-8 bottom-8 left-4 border-l border-slate-200/80 border-dashed" />
                
                {/* Node 1 */}
                <div className="flex items-start space-x-4 relative">
                  <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-205 border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-xs ring-4 ring-white mt-0.5">
                    01
                  </div>
                  <div>
                    <h6 className="font-display text-xs text-slate-900 font-bold">API Ingestion Scrape (Meteo + geocoding)</h6>
                    <p className="text-[11px] text-slate-600 mt-1 font-semibold">Decodes city names to coordinates, queries temperature max/min, rain sum, and relative humidity matrices.</p>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="flex items-start space-x-4 relative">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-mono font-bold text-xs ring-4 ring-white mt-0.5">
                    02
                  </div>
                  <div>
                    <h6 className="font-display text-xs text-slate-900 font-bold">Algorithmic Math Evaluation Matrix</h6>
                    <p className="text-[11px] text-slate-600 mt-1 font-semibold">Cross-references variables against the 6 industry thresholds to isolate active damage markers.</p>
                  </div>
                </div>

                {/* Node 3 */}
                <div className="flex items-start space-x-4 relative">
                  <div className="h-8 w-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-blue-750 text-blue-700 font-mono font-bold text-xs ring-4 ring-white mt-0.5">
                    03
                  </div>
                  <div>
                    <h6 className="font-display text-xs text-slate-900 font-bold">Targeted Playbook Pack Generation</h6>
                    <p className="text-[11px] text-slate-600 mt-1 font-semibold">Outputs precision Broad Match arrays, exclusion keywords, radius limits, and customer outreach text blueprints.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
                <motion.button
                  id="cta-nav-radar"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onRouteChange('#radar'); window.location.hash = '#radar'; }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 shadow-xl transition-all rounded-xl font-display text-xs tracking-wider uppercase font-bold cursor-pointer text-white"
                >
                  Enter Opportunity Radar Center
                </motion.button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PREVIEW OF CAMPAIGN GENERATOR ASSETS */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left preview representation representing structured copy templates */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bento-card p-6 font-mono text-[11px] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-bold tracking-wider uppercase text-slate-800 text-[10px]">SMS OUTBOUND PLAYBOOK PREVIEW</span>
                  </div>
                  <span className="text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">STABLE</span>
                </div>
                
                <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 font-sans leading-relaxed text-xs">
                  <p className="font-mono text-[9px] text-orange-400 mb-2">// OUTBOUND SYSTEM ADAPTER CODE: TX-ROOF-45</p>
                  <p className="italic">"Hey [Customer Name], this is [My Company] based in [City]. The National Meteorological alert just logged extreme wind gusts of [Max Wind]mph today. Your structural shingle layers may be loose or compromised. We are opening 5 priority inspection slots this week. Register DIRECT on our portal to lock yours."</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-sans pt-1">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>Includes complete Google Search Broad Match keywords structures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>Supplies DIY/salary-seeking client negative lists instantly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right text copy explaining Playbooks */}
            <div className="lg:col-span-6 space-y-6">
              <h4 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">Scientific Content Engine</h4>
              <h5 className="text-3xl font-display font-medium text-slate-900 tracking-tight leading-tighter">
                Highly localized, use-case specific contractor playbook packs
              </h5>
              <p className="text-slate-655 text-slate-600 text-sm leading-relaxed font-sans">
                Never waste advertising budget on generic, unoptimized ad structures. JobLeak provides ready-to-use search ad arrays, negative copy sheets, and call operator grids that convert high-urgency traffic.
              </p>
              
              <motion.button
                id="homepage-cta-camp-pack"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onRouteChange('#campaign'); window.location.hash = '#campaign'; }}
                className="px-6 py-3 bg-slate-900 border border-slate-950 text-white font-display text-xs font-bold uppercase tracking-wider hover:bg-slate-850 rounded-xl inline-flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>Explore Campaign Templates</span>
              </motion.button>
            </div>

          </div>
        </div>
      </section>

      {/* TRUSTED BY MEMBERS SHOWCASE */}
      <section className="py-20 border-t border-b border-slate-200/80 bg-slate-50/50 relative z-10">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full blue-glow-blob pointer-events-none opacity-20 z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="h-3 w-3 mr-1.5 text-blue-600" /> Member Network Integrity
            </span>
            <span className="block text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">National Operational Scale</span>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-slate-900">
              Trusted by 4,820+ Active Trade Members
            </h2>
            <p className="text-slate-655 text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
              Our regional exclusivity model ensures that verified local contractors maintain premium margins. No duplicate listings. No bidding wars.
            </p>
          </div>

          {/* Three Stunning Trust Pillars / Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Metric 1 */}
            <div className="bento-card p-8 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-10 w-10 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">NETWORK RETENTION</h4>
                  <p className="text-4xl font-display font-extrabold text-slate-950 tracking-tight mt-1">97.4%</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  Active contractors maintain their exclusive territory month over month, securing predictable seasonal ROI without marketing agency bloat.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Monthly Verified Retention</span>
                <span className="text-emerald-600 font-bold">Stable Range</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bento-card p-8 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-10 w-10 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">SAVED ADVERTISING WASTE</h4>
                  <p className="text-4xl font-display font-extrabold text-slate-950 tracking-tight mt-1">$3.4K<span className="text-base text-slate-500 font-normal">/mo avg</span></p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  By checking live weather triggers and cost-per-click CPC pressure indices, members dynamically adjust digital bids to stop paying high lead aggregators.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Calculated Peer Savings</span>
                <span className="text-blue-600 font-bold">$40.8K Annual</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bento-card p-8 bg-white border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                <div className="h-10 w-10 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider">EXCLUSIVITY RATING</h4>
                  <p className="text-4xl font-display font-extrabold text-slate-950 tracking-tight mt-1">100%</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  Unlike traditional platforms that sell duplicate leads to multiple local competitors, territory locks are strictly restricted to 1 active partner.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Contractual Exclusivity</span>
                <span className="text-indigo-600 font-bold">1 Vendor per Zip</span>
              </div>
            </div>

          </div>

          {/* Trade-Specific Network Distribution Board */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-lg">National Member distribution</h3>
                <p className="text-xs text-slate-500">Active subscriber volume segmented across verified service trade sectors</p>
              </div>
              <span className="mt-2 sm:mt-0 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded-lg border border-blue-200">
                Updated Live
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'HVAC Specialists', count: '1,840+ Shops', share: '38.1%', color: 'from-orange-500 to-amber-500' },
                { label: 'Roofing Contractors', count: '1,424+ Crews', share: '29.5%', color: 'from-blue-600 to-sky-555 to-sky-500' },
                { label: 'Plumbing Companies', count: '1,056+ Pros', share: '21.9%', color: 'from-indigo-600 to-violet-500' },
                { label: 'Other Active Trades', count: '500+ Operators', share: '10.5%', color: 'from-slate-700 to-slate-900' },
              ].map((trade, tIdx) => (
                <div key={tIdx} className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-500 font-mono font-bold block truncate">{trade.label}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">{trade.share}</span>
                  </div>
                  <p className="text-lg font-display font-black text-slate-900 tracking-tight">{trade.count}</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${trade.color} rounded-full`} 
                      style={{ width: trade.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <span className="flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Fully compliant with National Consumer Privacy standards. Members have signed SLA guarantees.</span>
              </span>
              <button 
                id="view-memberships-cta"
                onClick={() => { onRouteChange('#pricing'); window.location.hash = '#pricing'; }}
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Reserve Exclusive Territory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST / COMPLIANCE STATEMENT */}
      <section className="bg-slate-50 text-slate-700 py-12 border-t border-slate-200 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm tracking-tight text-slate-900 font-bold flex items-center justify-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Platform Integrity • Strictly Legitimate Public & Geolocation Feeds Only</span>
          </p>
          <p className="text-xs leading-relaxed max-w-2xl mx-auto text-slate-500 font-mono">
            All geolocation parameters and weather data aggregates are parsed in real time via Open-Meteo and official Weather.gov public APIs. We do not scrape private personal registers or distribute leaked customer listings. We estimate consumer intent values via public demand algorithms.
          </p>
        </div>
      </section>

      {/* 9. CALL TO ACTION TO SIGN UP/FREE SCAN */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-20 text-center shadow-inner relative z-10 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-0 opacity-[0.2] pointer-events-none saas-grid-bg" />
        <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-400/20 pointer-events-none blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h3 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Stop waiting for dry weeks. Trigger storms.
          </h3>
          <p className="text-blue-100 max-w-xl mx-auto leading-relaxed text-sm">
            Run an initial, 100% free contractor risk diagnostic of your specific localized city to see active HVAC, plumbing, or roofing signals instantly.
          </p>
          
          <div className="pt-2">
            <motion.button
              id="cta-homepage-bottom-scan"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onRouteChange('#scan'); window.location.hash = '#scan'; }}
              className="px-8 py-4 bg-slate-950 text-white hover:bg-slate-900 font-display font-bold uppercase tracking-widest rounded-xl shadow-2xl transition-all inline-flex items-center space-x-2 text-xs border border-transparent hover:border-slate-800 cursor-pointer"
            >
              <span>Build Free Regional Scanner Report</span>
              <ArrowRight className="h-4 w-4 text-blue-400 font-bold animate-pulse" />
            </motion.button>
          </div>
        </div>
      </section>

    </div>
  );
}
