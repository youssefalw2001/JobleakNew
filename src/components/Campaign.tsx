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
  Award
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
  callsLogged: number;
  jobsBooked: number;
  averageContractSize: number;
  checkedTasks: string[];
}

const LOCAL_STORAGE_KPI_KEY = 'jobleak_kpi_tracker_v1';

export default function Campaign({ scannedData, onNavigateToScan }: CampaignProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'lsa' | 'reactivation' | 'callscript'>('search');
  
  // KPI tracker local state with persistent cache
  const [kpis, setKpis] = useState<KPIState>({
    campaignLaunched: false,
    callsLogged: 0,
    jobsBooked: 0,
    averageContractSize: 1200,
    checkedTasks: []
  });

  // Load KPI State from localStorage to keep values sticky
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KPI_KEY);
      if (cached) {
        setKpis(JSON.parse(cached));
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
  const isExtremeHeat = maxTemp >= 95;
  const isSevereStorm = maxWind >= 35;

  // Compute calculated values
  const conversionRate = kpis.callsLogged > 0 ? ((kpis.jobsBooked / kpis.callsLogged) * 100).toFixed(1) : '0.0';
  const estimatedRevenue = kpis.jobsBooked * kpis.averageContractSize;

  const handleToggleLaunch = () => {
    const updated = { ...kpis, campaignLaunched: !kpis.campaignLaunched };
    saveKPIs(updated);
  };

  const handleAdjustCalls = (amount: number) => {
    const newVal = Math.max(0, kpis.callsLogged + amount);
    // Auto increment bookings standard percentage fallback for beautiful sandbox simulation
    let newBookings = kpis.jobsBooked;
    if (amount > 0 && newVal % 3 === 0) {
      newBookings += 1;
    }
    const updated = { ...kpis, callsLogged: newVal, jobsBooked: newBookings };
    saveKPIs(updated);
  };

  const handleAdjustBookings = (amount: number) => {
    const newVal = Math.max(0, kpis.jobsBooked + amount);
    // Ensure calls coordinates don't lag behind bookings logically
    const newCalls = Math.max(newVal, kpis.callsLogged);
    const updated = { ...kpis, jobsBooked: newVal, callsLogged: newCalls };
    saveKPIs(updated);
  };

  const handleAdjustContractValue = (amount: number) => {
    const newVal = Math.max(100, kpis.averageContractSize + amount);
    saveKPIs({ ...kpis, averageContractSize: newVal });
  };

  const handleResetSimulator = () => {
    const reset = {
      campaignLaunched: false,
      callsLogged: 0,
      jobsBooked: 0,
      averageContractSize: 1200,
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
              <span className="text-[10px] font-mono text-slate-500 uppercase">{city} Mode</span>
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
                className={`w-full py-2.5 rounded font-display font-bold text-xs uppercase tracking-wider transition-all shadow ${
                  kpis.campaignLaunched 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-white hover:bg-slate-100 text-slate-950'
                }`}
              >
                {kpis.campaignLaunched ? '✓ CAMPAIGN IS LIVE' : 'SYNC CAMPAIGN AS LIVE'}
              </button>
            </div>
          </div>

          {/* ACTIVE GOALS TRACKER / REVENUE LOGGER */}
          <div className="bento-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-mono text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                Launch Control Tracker KPI panel
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
              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Log Inbound Calls</span>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-display font-extrabold text-slate-900">{kpis.callsLogged}</span>
                  <div className="flex space-x-1 shrink-0">
                    <button 
                      onClick={() => handleAdjustCalls(-1)}
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded flex items-center justify-center font-bold text-xs focus:outline-none"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => handleAdjustCalls(1)}
                      className="w-5 h-5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xs focus:outline-none"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Jobs Closed/Booked</span>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-display font-extrabold text-slate-900">{kpis.jobsBooked}</span>
                  <div className="flex space-x-1 shrink-0">
                    <button 
                      onClick={() => handleAdjustBookings(-1)}
                      className="w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded flex items-center justify-center font-bold text-xs focus:outline-none"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => handleAdjustBookings(1)}
                      className="w-5 h-5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xs focus:outline-none"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Contract Calculator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>ESTIMATED average contract size</span>
                <span>${kpis.averageContractSize}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={() => handleAdjustContractValue(-50)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs"
                >
                  -$50
                </button>
                <input 
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={kpis.averageContractSize}
                  onChange={(e) => saveKPIs({ ...kpis, averageContractSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button 
                  onClick={() => handleAdjustContractValue(50)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs"
                >
                  +$50
                </button>
              </div>
            </div>

            {/* Estimated gross revenue performance indicators */}
            <div className="border-t border-slate-100 pt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Inbound Landing Conv. Rate:</span>
                <span className="text-slate-900 font-bold">{conversionRate}%</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Est. Localized Revenue:</span>
                <span className="text-emerald-600 font-extrabold flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ${estimatedRevenue.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* COLUMN RIGHT: INTERACTIVE TABBED BLUEPRINTS PLAYBOOKS */}
        <div className="lg:col-span-8 space-y-6 bento-card p-6 sm:p-8">
          
          <div className="border-b border-slate-200">
            <h3 className="text-xl font-display font-extrabold text-slate-950 mb-4 flex items-center leading-none">
              <BookOpen className="h-5.5 w-5.5 text-blue-600 mr-2" />
              Use-Case Specific Playbooks
            </h3>
            
            {/* Top Navigation categories */}
            <div className="flex flex-wrap -mb-px text-xs font-mono font-medium gap-1 sm:gap-2">
              <button
                id="tab-search-ppc"
                onClick={() => setActiveTab('search')}
                className={`px-4 py-3 border-b-2 rounded-t-lg transition-all ${
                  activeTab === 'search' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Intake Call Script
              </button>
            </div>
          </div>

          {/* TAB CONTENTS PANELS */}
          <div className="mt-4 transition-all">
            
            {/* 1. GOOGLE SEARCH TAB */}
            {activeTab === 'search' && (
              <div className="space-y-6" id="playbook-search-panel">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <h4 className="text-xs font-mono font-bold uppercase text-blue-800 flex items-center">
                    <Search className="h-4 w-4 mr-1.5" />
                    Google Search AdWords Structure
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Set campaign to <strong className="text-slate-900">Search Network Only</strong>, target locations strictly limited within <strong className="text-blue-700">{city} Metro</strong>. Limit bidding strategies to manual CPC or maximize conversions with tight caps to avoid high keyword cost creep during storms.
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-display font-bold text-sm text-slate-900">Broad Match Modifier Arrays</h5>
                  <div className="bg-slate-950 p-4 rounded text-slate-100 text-xs font-mono space-y-1.5 border border-slate-900">
                    {googleSearchData.keywords.map((kw, i) => (
                      <div key={i} className="flex justify-between hover:bg-slate-900 px-2 py-1 rounded">
                        <span>{kw}</span>
                        <span className="text-blue-400 text-[10px]">Broad/Phrase Mix</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-display font-bold text-sm text-slate-900">Non-DIY Search Exclusions (Negative Keywords)</h5>
                    <span className="text-[10px] font-mono text-red-500 bg-red-50 border border-red-200 px-2 rounded">
                      CRITICAL WASTE PROTECTION
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Add these phrase and exact negatives to block consumers seeking free guidance, schematic videos, or career paths.</p>
                  
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {googleSearchData.negatives.map((neg, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 font-semibold uppercase">
                        - {neg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-display font-bold text-sm text-slate-900">Ad Headlines & Creative Hooks</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans text-xs text-slate-700">
                    {googleSearchData.headlines.map((hl, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-150 p-3 rounded flex items-center space-x-2">
                        <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{hl} (Chars: {hl.length}/30)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-slate-200 rounded-lg text-xs leading-relaxed space-y-2">
                  <h5 className="text-white font-mono uppercase tracking-wider text-[10px] font-extrabold text-orange-400">// Conversion Asset Checklist</h5>
                  <p>Deploy landing pages with floating mobile-tap phone numbers, explicit contractor qualification credentials, immediate booking calendar grids, and testimonials from homeowners in <strong>{city}</strong>.</p>
                </div>
              </div>
            )}

            {/* 2. GOOGLE LSA CHECKLIST */}
            {activeTab === 'lsa' && (
              <div className="space-y-6" id="playbook-lsa-panel">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <h4 className="text-xs font-mono font-bold uppercase text-indigo-800 flex items-center">
                    <PhoneCall className="h-4 w-4 mr-1.5" />
                    Local Services Ads configuration Rules
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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
                            ? 'bg-blue-50/50 border-blue-200' 
                            : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
                          ) : (
                            <div className="h-4.5 w-4.5 border border-slate-350 bg-white rounded" />
                          )}
                        </div>
                        
                        <div>
                          <h5 className={`font-display font-bold text-xs ${isChecked ? 'text-blue-900 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{task.desc}</p>
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
                  <h4 className="text-xs font-mono font-bold uppercase text-purple-800 flex items-center">
                    <Send className="h-4 w-4 mr-1.5" />
                    Zero Cost Broadcast Copywriting
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Re-energize your current customer logs or list nodes. Sending an emergency local forecast warning with a priority booking booking calendar bypasses standard Google bidding costs.
                  </p>
                </div>

                {/* Email template */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-slate-400">OUTBOUND EMAIL BODY</span>
                    <span className="text-[9px] font-mono text-emerald-600 block bg-emerald-50 px-2 rounded font-bold">100% LOCALIZED copy</span>
                  </div>
                  
                  <div className="bg-slate-900 text-slate-200 rounded border border-slate-800 p-5 font-sans space-y-3 text-xs leading-relaxed">
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
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-800 flex items-center">
                    <ClipboardList className="h-4 w-4 mr-1.5" />
                    Qualifying Intake Workflows
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Once the phone rings, receptionist intake speed determines booking success. Lock down billing authorization and schedule coordinates within 4 minutes.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div className="border-l-2 border-emerald-500 pl-4 space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-slate-400">Step 1: Outbound Greeting</h5>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      "Thank you for calling [My Business], your premier {industry} resource here in <strong>{city}</strong>. This is [Receptionist Name], are you calling to book a priority {serviceText} dispatch slot?"
                    </p>
                  </div>

                  <div className="border-l-2 border-emerald-500 pl-4 space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-slate-400">Step 2: Emergency Urgency Qualification</h5>
                    <p className="text-slate-800 leading-relaxed">
                      "How long have you noticed the {serviceText.toLowerCase()} issue? Under active {city} weather conditions, it is critical we address this quickly before structural damage forces costlier overhauls."
                    </p>
                  </div>

                  <div className="border-l-2 border-emerald-500 pl-4 space-y-1.5">
                    <h5 className="font-mono text-[10px] uppercase font-bold text-slate-400 font-semibold">Step 3: Secure the Dispatch Fee</h5>
                    <p className="text-slate-800 leading-relaxed">
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
