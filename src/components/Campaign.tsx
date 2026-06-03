/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  PhoneCall, 
  Send, 
  MessageSquare, 
  ClipboardList, 
  CheckSquare, 
  DollarSign, 
  Plus, 
  Minus, 
  Percent, 
  TrendingUp, 
  MapPin, 
  Layers, 
  ShieldCheck,
  RefreshCw,
  Award,
  Copy,
  CheckCheck
} from 'lucide-react';
import { getMarketProfile, MarketProfile } from '../types';

interface CampaignProps {
  scannedData: {
    city: string;
    industry: string;
    serviceText: string;
    weather?: {
      maxTemp: number;
      minTemp: number;
      maxWind: number;
      maxRainProb: number;
      alerts: Array<{ event: string; severity: string }>;
    };
  } | null;
  onNavigateToScan: () => void;
}

interface KPIState {
  campaignLaunched: boolean;
  dailyBudget: number;
  targetCpa: number;
  checkedTasks: string[];
}

const LOCAL_STORAGE_KPI_KEY = 'jobleak_kpi_tracker_v1';

export default function Campaign({ scannedData, onNavigateToScan }: CampaignProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'lsa' | 'reactivation' | 'callscript'>('search');
  
  // Copy functionality state
  const [showWizard, setShowWizard] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = (text: string, fieldId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // KPI tracker local state with persistent cache
  const [kpis, setKpis] = useState<KPIState>({
    campaignLaunched: false,
    dailyBudget: 150,
    targetCpa: 65,
    checkedTasks: []
  });

  // Load KPI State from localStorage to keep values sticky
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KPI_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setKpis({
          ...parsed,
          dailyBudget: parsed.dailyBudget ?? 150,
          targetCpa: parsed.targetCpa ?? 65,
        });
      }
    } catch (e) {
      console.error('Failed to load local campaign tracker KPIs:', e);
    }
  }, []);

  const saveKPIs = (updated: KPIState) => {
    setKpis(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KPI_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save KPI tracker:', e);
    }
  };

  // Safe defaults if there's no scan loaded
  const city = scannedData?.city || 'Austin';
  const industry = scannedData?.industry || 'HVAC';
  const serviceText = scannedData?.serviceText || 'Emergency AC repair & coil blowout';
  
  // Fetch market rates and profile metrics
  const profile = getMarketProfile(city);
  const maxTemp = scannedData?.weather?.maxTemp ?? 92;
  const maxWind = scannedData?.weather?.maxWind ?? 14;

  // Compute forecast metrics
  const estimatedCpc = industry.toLowerCase() === 'plumbing' ? 24 : industry.toLowerCase() === 'mold' ? 45 : 18;
  const clicksPerDay = Math.floor(kpis.dailyBudget / estimatedCpc);
  const convRateBase = kpis.dailyBudget > 100 ? 0.15 : 0.08; 
  const forecastedLeads = Math.floor(clicksPerDay * convRateBase * 30); // Monthly Leads
  const estimatedRevenue = forecastedLeads * 1250; // Avg contract size

  const handleToggleLaunch = () => {
    const updated = { ...kpis, campaignLaunched: !kpis.campaignLaunched };
    saveKPIs(updated);
  };

  const handleResetSimulator = () => {
    const reset = {
      campaignLaunched: false,
      dailyBudget: 150,
      targetCpa: 65,
      checkedTasks: []
    };
    saveKPIs(reset);
  };

  const handleToggleTask = (task: string) => {
    const isChecked = kpis.checkedTasks.includes(task);
    const updatedTasks = isChecked 
      ? kpis.checkedTasks.filter(t => t !== task)
      : [...kpis.checkedTasks, task];
    
    saveKPIs({ ...kpis, checkedTasks: updatedTasks });
  };

  // Contractor playbook data structures specifically localizing to scanned inputs
  const googleSearchData = {
    keywords: [
      `+emergency +${industry.toLowerCase()} +${city.toLowerCase()}`,
      `+local +${industry.toLowerCase()} +repair`,
      `"${city.toLowerCase()} ${serviceText.toLowerCase()}"`,
      `+same +day +${industry.toLowerCase()} +service`,
      `[${city.toLowerCase()} ${industry.toLowerCase()} repair]`,
    ],
    headlines: [
      `Emergency ${industry} Repair - ${city}`,
      `24/7 Qualified Technicians Near You`,
      `Same-Day ${serviceText} Dispatch`,
      `No Hidden Scrape Fees - JobLeak Verified`
    ],
    negatives: [
      'diy', 'jobs', 'salary', 'career', 'unemployment', 'tool rental', 'training', 'free video', 'youtube', 'schematic'
    ]
  };

  const lsaChecklist = [
    { title: `Radius Focus: Set precisely within 15 miles of geocoded central coordinates.`, desc: 'Avoid sprawling out of reach. Target extreme localized weather neighborhoods.' },
    { title: `Business Hours Overrides: Enable '24/7 Emergency Dispatch' during weather warning window.`, desc: `Currently active alerts indicate a local surge is ongoing. Ready callers expect immediate human pickup.` },
    { title: `Bid Settings: Switch to 'Maximize Leads' automated portfolio modeling.`, desc: 'LSA algorithms award heavy preference to high proximity and instantaneous pickup rates.' },
    { title: `Active Licensure: Ensure licenses & structural certificates are up-to-date.`, desc: 'Google verifies credentials which guarantees green background badges.' }
  ];

  return (
    <div id="campaign-cockpit-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 2-COLUMN LAYOUT CONSTRUCT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN LEFT: STICKY METRIC PORTRAIT CARDS */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* ACTIVE OPPORTUNITY SUMMARY CARD */}
          <div className="bento-card-dark p-5 space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none admin-radar-grid" />
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-mono tracking-wider font-extrabold uppercase">
                  ACTIVE SCOUT METRICS
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">{city} Mode</span>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-mono leading-none text-slate-400">TARGET MARKET</div>
              <p className="text-xl font-display font-extrabold text-white flex items-center gap-1.5">
                <MapPin className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                {city} ({profile.name !== 'Default' ? `${profile.growth}% Growth` : 'Standard Market'})
              </p>

              <div className="text-[11px] font-mono leading-none text-slate-400 pt-1">ACTIVE CLASSIFIED CATEGORY</div>
              <p className="text-md text-slate-200 font-sans font-semibold">
                {industry} Services — <span className="text-blue-400">{serviceText}</span>
              </p>

              {scannedData?.weather ? (
                <div className="mt-3 bg-slate-900 p-3 rounded border border-slate-800 text-[11px] space-y-1 text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Forecast Temp Range:</span>
                    <span className="text-slate-200">{scannedData.weather.minTemp}°F - {scannedData.weather.maxTemp}°F</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Max Wind Gust Velocity:</span>
                    <span className="text-slate-200">{scannedData.weather.maxWind} mph</span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={onNavigateToScan}
                  className="w-full mt-2 py-2 text-center bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[11px] font-mono transition-all"
                >
                  Retrieve Active Met Scan Parameters
                </button>
              )}
            </div>

            {/* Launch Checklist toggle link */}
            <div className="pt-2">
              <button
                onClick={handleToggleLaunch}
                className={`w-full py-2.5 rounded font-display font-bold text-sm uppercase tracking-wider transition-all shadow ${
                  kpis.campaignLaunched 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-slate-900 hover:bg-slate-100 text-white'
                }`}
              >
                {kpis.campaignLaunched ? '✓ CAMPAIGN IS LIVE' : 'SYNC CAMPAIGN AS LIVE'}
              </button>
            </div>
          </div>

          {/* BUDGET & FORECASTING SIMULATOR */}
          <div className="bento-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-mono text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                Campaign Forecast Engine
              </h3>
              
              <button 
                onClick={handleResetSimulator}
                className="text-slate-400 hover:text-red-500 p-1 rounded font-mono text-[10px] flex items-center space-x-1"
                title="Reset simulation parameters"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Simulated Live Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Est. Mo. Leads</span>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-display font-extrabold text-white">{forecastedLeads}</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Avg CPC ({industry})</span>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-display font-extrabold text-blue-400">${estimatedCpc.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Daily Budget Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>DAILY AD BUDGET</span>
                <span className="text-white font-bold">${kpis.dailyBudget}</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={kpis.dailyBudget}
                  onChange={(e) => saveKPIs({ ...kpis, dailyBudget: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Target CPA Slider */}
            <div className="space-y-2 pb-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>TARGET CPA</span>
                <span className="text-white font-bold">${kpis.targetCpa}</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={kpis.targetCpa}
                  onChange={(e) => saveKPIs({ ...kpis, targetCpa: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Estimated gross revenue performance indicators */}
            <div className="border-t border-slate-700 pt-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Est. Target Conv. Rate:</span>
                <span className="text-white font-bold">{(convRateBase * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Projected Monthly Revenue:</span>
                <span className="text-emerald-500 font-extrabold flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ${estimatedRevenue.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* COLUMN RIGHT: INTERACTIVE TABBED BLUEPRINTS PLAYBOOKS */}
        <div className="lg:col-span-8 space-y-6 bento-card p-6 sm:p-8">
          
          <div className="border-b border-slate-700">
            <h3 className="text-xl font-display font-extrabold text-white mb-4 flex items-center leading-none">
              <BookOpen className="h-5.5 w-5.5 text-blue-600 mr-2" />
              Use-Case Specific Playbooks
            </h3>
            
            {/* Top Navigation categories */}
            <div className="flex flex-wrap -mb-px text-sm font-mono font-medium gap-1 sm:gap-2">
              <button
                id="tab-search-ppc"
                onClick={() => setActiveTab('search')}
                className={`px-4 py-3 border-b-2 rounded-t-lg transition-all ${
                  activeTab === 'search' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                Google Search PPC
              </button>
              
              <button
                id="tab-lsa-checklist"
                onClick={() => setActiveTab('lsa')}
                className={`px-4 py-3 border-b-2 rounded-t-lg transition-all ${
                  activeTab === 'lsa' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                Google LSA Voice
              </button>

              <button
                id="tab-react-templates"
                onClick={() => setActiveTab('reactivation')}
                className={`px-4 py-3 border-b-2 rounded-t-lg transition-all ${
                  activeTab === 'reactivation' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                List Reactivation
              </button>

              <button
                id="tab-call-scripts"
                onClick={() => setActiveTab('callscript')}
                className={`px-4 py-3 border-b-2 rounded-t-lg transition-all ${
                  activeTab === 'callscript' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                Intake Call Script
              </button>
            </div>
          </div>

          {/* TAB CONTENTS PANELS */}
          <div className="mt-4 transition-all">
            
            {/* 1. GOOGLE SEARCH PRESET CONFIGURATOR */}
            {activeTab === 'search' && (
              <div className="space-y-6" id="playbook-search-panel">
                {showWizard ? (
                  <div className="p-6 bg-slate-900 border border-blue-500/50 rounded-xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400"></div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-display font-bold text-white flex items-center">
                          <CheckCheck className="h-6 w-6 mr-2 text-blue-400" />
                          Launch Configuration Wizard
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">Follow these 3 steps to replicate our high-converting template perfectly.</p>
                      </div>
                      <button 
                        onClick={() => setShowWizard(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Step 1 */}
                      <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400 font-mono">1</div>
                        <div className="flex-1">
                          <h5 className="text-white font-bold mb-1">Create Campaign</h5>
                          <p className="text-xs text-slate-400 mb-3">Login to Google Ads &gt; New Campaign &gt; Leads &gt; Search Network.</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400 font-mono">2</div>
                        <div className="flex-1">
                          <h5 className="text-white font-bold mb-1">Paste Targeted Keywords</h5>
                          <p className="text-xs text-slate-400 mb-3">Copy this exact sequence to capture highest-intent search traffic.</p>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative group">
                            <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap">{googleSearchData.keywords.map(kw => `[${kw}]`).join('\n')}</pre>
                            <button 
                              onClick={() => handleCopyField(googleSearchData.keywords.map(kw => `[${kw}]`).join('\n'), 'keywords')}
                              className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedField === 'keywords' ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400 font-mono">3</div>
                        <div className="flex-1">
                          <h5 className="text-white font-bold mb-1">Paste Ad Copy</h5>
                          <p className="text-xs text-slate-400 mb-3">Lock in our optimized ad framing to maximize your click-through rate.</p>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center group">
                            <div>
                              <div className="text-[10px] text-slate-500 font-mono mb-1">HEADLINE 1</div>
                              <div className="text-sm font-bold text-white">{googleSearchData.headlines[0]}</div>
                            </div>
                            <button 
                              onClick={() => handleCopyField(googleSearchData.headlines[0], 'hl1')}
                              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedField === 'hl1' ? <><CheckCheck className="h-3 w-3 text-emerald-400" /> COPIED</> : <><Copy className="h-3 w-3" /> COPY</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                      <div>
                        <h4 className="text-lg font-display font-bold text-white flex items-center">
                          <Search className="h-5 w-5 mr-2 text-blue-400" />
                          Google Ads 1-Click Preset
                        </h4>
                        <p className="text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                          We've pre-configured the perfect high-urgency campaign for <strong className="text-white">{city}</strong>. Just copy these settings into your Google Ads account to start capturing local leads instantly.
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowWizard(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 shrink-0"
                      >
                        <Search className="h-3.5 w-3.5" /> Launch Preset
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campaign Structure Presets */}
                  <div className="space-y-3">
                    <h5 className="font-display font-bold text-sm text-white border-b border-slate-800 pb-2">Campaign Settings</h5>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex justify-between bg-slate-900/50 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400">Network:</span>
                        <strong className="text-white">Search Network Only</strong>
                      </li>
                      <li className="flex justify-between bg-slate-900/50 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400">Location Targeting:</span>
                        <strong className="text-blue-400">{city} Metro (15mi radius)</strong>
                      </li>
                      <li className="flex justify-between bg-slate-900/50 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400">Bidding Strategy:</span>
                        <strong className="text-white">Maximize Conversions</strong>
                      </li>
                    </ul>
                  </div>

                  {/* Ready-to-use Keywords */}
                  <div className="space-y-3">
                    <h5 className="font-display font-bold text-sm text-white border-b border-slate-800 pb-2">Top Performing Keywords</h5>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-slate-200 text-sm font-mono space-y-1.5 overflow-hidden">
                      {googleSearchData.keywords.slice(0, 4).map((kw, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleCopyField(kw, `kw_${i}`)}
                          className="flex justify-between items-center group cursor-pointer"
                        >
                          <span className="truncate mr-2">{kw}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-400 font-bold transition-opacity">
                            {copiedField === `kw_${i}` ? 'COPIED' : 'COPY'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pre-written Ads */}
                <div className="space-y-3 pt-2">
                  <h5 className="font-display font-bold text-sm text-white">Pre-written High-Converting Ads</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {googleSearchData.headlines.map((hl, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleCopyField(hl, `ad_hl_${i}`)}
                        className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl transition-colors group cursor-pointer"
                      >
                        <div className="text-xs text-blue-400 font-mono mb-1 flex justify-between">
                          Headline {i + 1}
                          {copiedField === `ad_hl_${i}` && <CheckCheck className="h-3 w-3 text-emerald-400" />}
                        </div>
                        <div className="text-sm text-white font-medium">{hl}</div>
                        <div className="mt-2 text-[10px] text-slate-500 group-hover:text-slate-300">
                          {copiedField === `ad_hl_${i}` ? 'Copied to clipboard!' : 'Click to copy'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. GOOGLE LSA CHECKLIST */}
            {activeTab === 'lsa' && (
              <div className="space-y-6" id="playbook-lsa-panel">
                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                  <h4 className="text-sm font-mono font-bold uppercase text-indigo-400 flex items-center">
                    <PhoneCall className="h-4 w-4 mr-1.5" />
                    Local Services Ads configuration Rules
                  </h4>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    LSA runs primarily on voice leads and direct telephone rings. Unlike standard Google Ads, you pay strictly per qualified caller rather than clicks. This is ideal for HVAC furnace freeze surges or hurricane roof damage repairs when users call the top 3 cards directly on small mobile screens.
                  </p>
                </div>

                <div className="space-y-4">
                  {lsaChecklist.map((task, idx) => {
                    const taskId = `lsa-task-${idx}`;
                    const isChecked = kpis.checkedTasks.includes(taskId);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleToggleTask(taskId)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                          isChecked 
                            ? 'bg-blue-900/20 border-blue-500/30' 
                            : 'bg-slate-900/50 border-slate-700/80 hover:bg-slate-800'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-blue-400" />
                          ) : (
                            <div className="h-4 w-4 border border-slate-500 bg-slate-900 rounded" />
                          )}
                        </div>
                        
                        <div>
                          <h5 className={`font-display font-bold text-sm ${isChecked ? 'text-blue-200 line-through' : 'text-white'}`}>
                            {task.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{task.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. LIST REACTIVATION TAB */}
            {activeTab === 'reactivation' && (
              <div className="space-y-6" id="playbook-react-panel">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                  <h4 className="text-sm font-mono font-bold uppercase text-purple-800 flex items-center">
                    <Send className="h-4 w-4 mr-1.5" />
                    Zero Cost Broadcast Copywriting
                  </h4>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Re-energize your current customer logs or list nodes. Sending an emergency local forecast warning with a priority booking booking calendar bypasses standard Google bidding costs.
                  </p>
                </div>

                {/* Email template */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-slate-400">OUTBOUND EMAIL BODY</span>
                    <span className="text-[9px] font-mono text-emerald-600 block bg-emerald-50 px-2 rounded font-bold">100% LOCALIZED copy</span>
                  </div>
                  
                  <div className="bg-slate-900 text-slate-200 rounded border border-slate-800 p-5 font-sans space-y-3 text-sm leading-relaxed">
                    <div className="font-mono text-[10px] text-purple-400 border-b border-slate-800 pb-2 mb-2">
                      <strong>Subject:</strong> Emergency Local Advisory: Weather warning indicates immediate {industry.toLowerCase()} hazards in {city}
                    </div>
                    
                    <p>Hi [Customer First Name],</p>
                    
                    <p>This is the engineering dispatch desk from [My Business] here in <strong>{city}</strong>.</p>
                    
                    <p>This morning, meteorology meters logged severe indicators across our local municipal grid. Current warning forecasts outline temperatures exceeding {maxTemp}°F (or severe wind/freeze alerts) which places intense stress on regional structures.</p>
                    
                    <p>If you have not executed seasonal maintenance checkups on your <strong>{serviceText.toLowerCase()}</strong> systems within the calendar year, you are at high risk of immediate structural blowout or leak damage.</p>
                    
                    <p>To support neighbors in <strong>{city}</strong>, we are dispatching emergency service operators across zip codes today. Tap below to check local coverage and schedule an inspection before emergency call queues spike:</p>
                    
                    <p className="font-bold underline text-blue-400 py-1">[Tap to Schedule Priority Coordinate Call]</p>
                    
                    <p className="text-slate-400">Respectfully,<br />The Dispatch Desk, [My Business Name]</p>
                  </div>
                </div>

                {/* Optional SMS block */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-slate-400 block">Outbound Opt-In SMS Template</span>
                  <div className="p-4 bg-slate-950 text-slate-100 font-mono text-[11px] rounded leading-relaxed border border-slate-900">
                    <p className="text-orange-400 mb-2">// SMS Restricted to Opt-In Contacts Only (160 Characters)</p>
                    <p>"Hey [First Name] - Weather alert logs severe environmental stresses today in {city}. Lock in priority same-day {industry.toLowerCase()} inspections before {serviceText.toLowerCase()} emergencies spike. Direct reply back secures your spot. Stop to end."</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. INTAKE CALL SCRIPT */}
            {activeTab === 'callscript' && (
              <div className="space-y-6" id="playbook-script-panel">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <h4 className="text-sm font-mono font-bold uppercase text-emerald-800 flex items-center">
                    <ClipboardList className="h-4 w-4 mr-1.5" />
                    Qualifying Intake Workflows
                  </h4>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Once the phone rings, receptionist intake speed determines booking success. Lock down billing authorization and schedule coordinates within 4 minutes.
                  </p>
                </div>

                <div className="space-y-4 text-sm font-sans">
                  <div className="border-l-2 border-emerald-500 pl-4 space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-slate-400">Step 1: Outbound Greeting</h5>
                    <p className="text-slate-100 leading-relaxed font-medium">
                      "Thank you for calling [My Business], your premier {industry} resource here in <strong>{city}</strong>. This is [Receptionist Name], are you calling to book a priority {serviceText} dispatch slot?"
                    </p>
                  </div>

                  <div className="border-l-2 border-emerald-500 pl-4 space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-slate-400">Step 2: Emergency Urgency Qualification</h5>
                    <p className="text-slate-100 leading-relaxed">
                      "How long have you noticed the {serviceText.toLowerCase()} issue? Under active {city} weather conditions, it is critical we address this quickly before structural damage forces costlier overhauls."
                    </p>
                  </div>

                  <div className="border-l-2 border-emerald-500 pl-4 space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-slate-400 font-semibold">Step 3: Secure the Dispatch Fee</h5>
                    <p className="text-slate-100 leading-relaxed">
                      "We have qualified technicians dispatching throughout your neighboring blocks this afternoon. Our standard diagnostic and mobilization fee is only $99, which we completely deduct from any repair work you finalize today. Shall we secure your slot with a credit card now?"
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
