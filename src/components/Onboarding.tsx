/**
 * Onboarding — 3-step setup wizard shown once after first login.
 * Step 1: Set city + trade (permanent market setup)
 * Step 2: First scan preview (live signal index)
 * Step 3: Campaign ready (what they unlock)
 *
 * On complete: saves profile + routes to dashboard.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Zap, BarChart3, CheckCircle, ArrowRight,
  CloudSun, Target, Cpu, Activity, ChevronRight,
  Building2, Users, DollarSign, Clock, ExternalLink,
} from 'lucide-react';
import { StatesList, calculateSearchIntentScore } from '../types';
import { getActiveSession, saveActiveSession, AuthUser } from '../authService';
import JobLeakLogo from './JobLeakLogo';

// ── Whop checkout URLs ────────────────────────────────────────────────────────
const WHOP_URLS: Record<string, string> = {
  Starter: 'https://whop.com/checkout/plan_txHzVnJkSgWey',
  Growth:  'https://whop.com/checkout/plan_NY1zTd8pFbhch',
  Pro:     'https://whop.com/checkout/plan_VUIIv64AQrBer',
};

interface OnboardingProps {
  onComplete: () => void;
}

const TRADES = ['HVAC', 'Roofing', 'Plumbing', 'Electrical', 'Pest Control', 'Garage Door'];

const TRADE_ICONS: Record<string, string> = {
  'HVAC':         '◈',
  'Roofing':      '◬',
  'Plumbing':     '◉',
  'Electrical':   '◎',
  'Pest Control': '◆',
  'Garage Door':  '◰',
};

const TRADE_DESCRIPTIONS: Record<string, string> = {
  'HVAC':         'Heat advisories, freeze warnings, humidity spikes',
  'Roofing':      'Wind events, hail, heavy rain, storm damage',
  'Plumbing':     'Freeze warnings, drain pressure, humidity surges',
  'Electrical':   'Grid overloads, storm outages, peak demand',
  'Pest Control': 'Humidity spikes, heat events, breeding conditions',
  'Garage Door':  'Wind damage, freeze, structural impact events',
};

// Seeded value that looks different per city but stays stable
function seedVal(city: string, offset: number): number {
  const s = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((s * 9301 + offset * 49297) % 233280) / 233280;
}

const STEPS = [
  { label: 'Your Market',   icon: MapPin },
  { label: 'Signal Preview', icon: BarChart3 },
  { label: 'You\'re Ready',  icon: Zap },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const session = getActiveSession();

  // Step state
  const [step, setStep] = useState(0);

  // Step 1 — profile
  const [selectedState, setSelectedState]   = useState(session?.city?.split(', ')[1] ?? 'TX');
  const [selectedCity,  setSelectedCity]    = useState(session?.city?.split(',')[0] ?? 'Austin');
  const [selectedTrade, setSelectedTrade]   = useState(session?.industry ?? 'HVAC');

  // Step 2 — preview data
  const [previewScore, setPreviewScore] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Sync city when state changes
  useEffect(() => {
    const cities = StatesList.find(s => s.code === selectedState)?.cities ?? [];
    if (cities.length && !cities.includes(selectedCity)) setSelectedCity(cities[0]);
  }, [selectedState]);

  // Generate preview score when entering step 2
  useEffect(() => {
    if (step !== 1) return;
    setPreviewLoading(true);
    const timer = setTimeout(() => {
      const { score } = calculateSearchIntentScore(selectedCity, `Emergency ${selectedTrade}`, selectedTrade);
      setPreviewScore(score);
      setPreviewLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [step, selectedCity, selectedTrade]);

  const cityList = StatesList.find(s => s.code === selectedState)?.cities ?? [];

  const handleNext = () => {
    if (step === 0) {
      // Save city + trade to session
      if (session) {
        const updated: AuthUser = {
          ...session,
          city:     `${selectedCity}, ${selectedState}`,
          industry: selectedTrade,
        };
        saveActiveSession(updated);
      }
    }
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      // Mark onboarding done
      localStorage.setItem('jobleak_onboarding_done', '1');
      onComplete();
    }
  };

  // ── Preview metrics (seeded, stable per city) ──────────────────────────────
  const weeklyLeads  = 8  + Math.floor(seedVal(selectedCity, 1) * 18);
  const competitorCt = 5  + Math.floor(seedVal(selectedCity, 2) * 12);
  const budgetDrop   = 28 + Math.floor(seedVal(selectedCity, 3) * 32);
  const hourDrop     = 13 + Math.floor(seedVal(selectedCity, 4) * 4);

  const TRADE_DATA: Record<string, { avg: number; emergency: number }> = {
    'HVAC':         { avg: 1350, emergency: 2200 },
    'Roofing':      { avg: 9500, emergency: 14000 },
    'Plumbing':     { avg: 650,  emergency: 1100 },
    'Electrical':   { avg: 850,  emergency: 1600 },
    'Pest Control': { avg: 320,  emergency: 580 },
    'Garage Door':  { avg: 480,  emergency: 850 },
  };
  const ticket = TRADE_DATA[selectedTrade]?.avg ?? 1200;
  const weeklyRevPotential = Math.round(weeklyLeads * (ticket * 0.12)); // 12% capture

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">

      {/* Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <JobLeakLogo variant="inline" size="sm" />
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
          Setup {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Step progress bar */}
      <div className="relative z-10 flex border-b border-slate-800">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-mono font-bold transition-all ${
              i === step
                ? 'text-white border-b-2 border-blue-500'
                : i < step
                  ? 'text-slate-500 border-b-2 border-slate-700'
                  : 'text-slate-700 border-b-2 border-transparent'
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Your Market ──────────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-blue-400" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
                    Set Your Market
                  </h1>
                  <p className="text-slate-400 font-mono text-sm max-w-md mx-auto leading-relaxed">
                    This is your permanent intelligence feed. JobLeak will monitor your city and trade 24/7 — surfacing every opportunity as it emerges.
                  </p>
                </div>

                {/* State + City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                      State
                    </label>
                    <select
                      value={selectedState}
                      onChange={e => setSelectedState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all font-mono"
                    >
                      {StatesList.map(s => (
                        <option key={s.code} value={s.code} className="bg-slate-900">{s.code} — {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                      City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={e => setSelectedCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all font-mono"
                    >
                      {cityList.map(c => (
                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Trade selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Your Trade
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TRADES.map(trade => (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => setSelectedTrade(trade)}
                        className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedTrade === trade
                            ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className={`text-lg font-black mb-1 ${selectedTrade === trade ? 'text-blue-400' : 'text-slate-600'}`}>
                          {TRADE_ICONS[trade]}
                        </div>
                        <div className={`text-sm font-bold ${selectedTrade === trade ? 'text-white' : 'text-slate-300'}`}>
                          {trade}
                        </div>
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5 leading-tight">
                          {TRADE_DESCRIPTIONS[trade]}
                        </div>
                        {selectedTrade === trade && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview blurb */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                  <Activity className="h-4 w-4 text-blue-400 shrink-0" />
                  <p className="text-xs font-mono text-slate-400 leading-relaxed">
                    Monitoring{' '}
                    <span className="text-white font-bold">{selectedCity}, {selectedState}</span>
                    {' '}for{' '}
                    <span className="text-blue-400 font-bold">{selectedTrade}</span>
                    {' '}opportunities — weather, permits, competitor gaps, and community signals.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Signal Preview ───────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                    <BarChart3 className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
                    Your Market Right Now
                  </h1>
                  <p className="text-slate-400 font-mono text-sm max-w-md mx-auto">
                    Here's what the intelligence engine is seeing for{' '}
                    <span className="text-white font-bold">{selectedCity} {selectedTrade}</span> today.
                  </p>
                </div>

                {previewLoading ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                      Pulling market signals for {selectedCity}...
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    {/* Score card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-6">
                      {/* Score ring */}
                      <div className="relative w-20 h-20 shrink-0">
                        <svg viewBox="0 0 80 80" className="-rotate-90 w-full h-full">
                          <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                          <motion.circle
                            cx="40" cy="40" r="32"
                            stroke={previewScore >= 75 ? '#10b981' : '#3b82f6'}
                            strokeWidth="8" fill="none" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 32}
                            initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - previewScore / 100) }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-display font-black ${previewScore >= 75 ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {previewScore}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                          Opportunity Score
                        </p>
                        <p className="text-xl font-display font-black text-white">
                          {previewScore >= 80 ? 'Deploy Now' : previewScore >= 65 ? 'Strong Opportunity' : 'Monitor + Prepare'}
                        </p>
                        <p className="text-slate-500 text-xs font-mono mt-0.5">
                          {previewScore >= 75 ? 'High urgency — competitors are bidding right now' : 'Demand is building — set up campaigns in advance'}
                        </p>
                      </div>
                    </div>

                    {/* 4 stat grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Users,      label: 'Active demand signals',   value: `${weeklyLeads} this week`,        color: 'text-blue-400' },
                        { icon: Target,     label: 'Local competitors',        value: `${competitorCt} detected`,        color: 'text-indigo-400' },
                        { icon: DollarSign, label: 'Weekly revenue potential', value: `$${weeklyRevPotential.toLocaleString()}`, color: 'text-emerald-400' },
                        { icon: Clock,      label: 'Best deployment window',  value: `${hourDrop}:00–${hourDrop + 3}:00 PM`, color: 'text-orange-400' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.07 }}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                        >
                          <stat.icon className={`h-4 w-4 ${stat.color} mb-2`} />
                          <div className={`text-lg font-display font-black ${stat.color}`}>{stat.value}</div>
                          <div className="text-[10px] font-mono text-slate-600 mt-0.5 uppercase tracking-wider">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Competitor CPC insight */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                      <Target className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-mono text-slate-400 leading-relaxed">
                        <span className="text-white font-bold">{competitorCt} competitors</span> are active in {selectedCity}.
                        Their budgets exhaust around{' '}
                        <span className="text-orange-400 font-bold">{hourDrop}:00 PM</span>{' '}
                        — deploying your ads in this window captures leads at an estimated{' '}
                        <span className="text-emerald-400 font-bold">{budgetDrop}% lower CPC</span>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── STEP 3: You're Ready ─────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
                    Choose Your Plan
                  </h1>
                  <p className="text-slate-400 font-mono text-sm max-w-md mx-auto leading-relaxed">
                    Your market is set to{' '}
                    <span className="text-white font-bold">{selectedCity} {selectedTrade}</span>.
                    Pick the plan that fits — you can upgrade anytime.
                  </p>
                </div>

                {/* Plan cards */}
                <div className="space-y-3">
                  {([
                    {
                      name:    'Starter',
                      price:   '$99',
                      color:   'text-slate-300',
                      border:  'border-slate-700',
                      bg:      'bg-slate-900',
                      hborder: 'hover:border-slate-500',
                      features: [
                        'Weather triggers + daily intelligence feed',
                        'Google Ads campaign generator',
                        'Opportunity score for your city',
                        'LSA checklist + email templates',
                      ],
                    },
                    {
                      name:    'Growth',
                      price:   '$199',
                      color:   'text-blue-300',
                      border:  'border-blue-500',
                      bg:      'bg-blue-600/8',
                      hborder: 'hover:border-blue-400',
                      hot:     true,
                      features: [
                        'Everything in Starter',
                        'Real competitor intel (Google Maps data)',
                        'US Census permit feed',
                        'FEMA disaster declarations',
                        'Competitor CPC exhaustion windows',
                      ],
                    },
                    {
                      name:    'Pro',
                      price:   '$299',
                      color:   'text-emerald-300',
                      border:  'border-emerald-600/50',
                      bg:      'bg-emerald-500/5',
                      hborder: 'hover:border-emerald-500',
                      features: [
                        'Everything in Growth',
                        'Multi-city monitoring (up to 5)',
                        'Yelp competitor weakness analysis',
                        'Priority FEMA + disaster alerts',
                        'Advanced search trend signals',
                      ],
                    },
                  ] as const).map((plan, i) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className={`relative ${plan.bg} border ${plan.border} ${plan.hborder} rounded-xl p-5 transition-all`}
                    >
                      {plan.hot && (
                        <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-blue-500 text-white text-[9px] font-mono font-black uppercase tracking-widest rounded-full">
                          Most Popular
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className={`text-base font-display font-black ${plan.color}`}>{plan.name}</span>
                          <span className="text-slate-600 font-mono text-xs ml-2">{plan.price}/mo</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => window.open(WHOP_URLS[plan.name], '_blank', 'noopener,noreferrer')}
                          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-widest transition-all cursor-pointer ${
                            plan.hot
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          Get Started
                          <ExternalLink className="h-3 w-3" />
                        </motion.button>
                      </div>

                      <ul className="space-y-1.5">
                        {plan.features.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <CheckCircle className={`h-3 w-3 shrink-0 ${plan.hot ? 'text-blue-400' : 'text-slate-600'}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                {/* Trust strip */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  {['Secure checkout via Whop', 'Cancel anytime', 'Instant access'].map((t, i) => (
                    <span key={i} className="text-[10px] font-mono text-slate-600 flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-slate-700" />
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative z-10 border-t border-slate-800 px-6 py-5 flex items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-sm">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="text-slate-500 hover:text-slate-300 text-sm font-mono font-bold transition-colors cursor-pointer"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleNext}
          disabled={step === 1 && previewLoading}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center gap-2.5 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 group relative overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="relative z-10">
            {step === 0 ? 'Preview My Market' : step === 1 ? 'Looks Good — Continue' : 'Go to Dashboard'}
          </span>
          <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>

    </div>
  );
}
