/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HOMEPAGE — Lean, high-converting landing page.
 * Sections: Hero → How It Works → Metrics Strip → Comparison Table → Testimonials → CTA
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  CloudSun,
  Search,
  BarChart3,
  Check,
  TrendingUp,
  ShieldCheck,
  Radio,
  Database,
  Star,
  Activity,
  Target,
  Cpu,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MarketProfiles, calculateSearchIntentScore, getMarketProfile } from '../types';

interface HomepageProps {
  onStartInstantScan: (city: string, industry: string, serviceText: string) => void;
  onRouteChange: (route: string) => void;
}

export default function Homepage({ onStartInstantScan, onRouteChange }: HomepageProps) {
  const [previewCity, setPreviewCity]         = useState('Austin');
  const [previewIndustry, setPreviewIndustry] = useState('HVAC');
  const [serviceText, setServiceText]         = useState('Emergency AC repair and compressor blowouts');

  const previewProfile  = getMarketProfile(previewCity);
  const { score: previewIntentScore, competition, cpcTier } = calculateSearchIntentScore(previewCity, serviceText, previewIndustry);

  return (
    <div className="min-h-screen text-slate-100 relative">

      {/* ─── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28 border-b border-slate-800">
        {/* Background */}
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-3xl pointer-events-none z-0" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-3xl pointer-events-none z-0" />
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none saas-grid-bg" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left — copy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-7"
            >
              {/* ── Animated brand name — letter by letter ── */}
              <div className="flex items-end gap-1 overflow-visible">
                {/* "JOB" — white */}
                {'JOB'.split('').map((letter, i) => (
                  <motion.div
                    key={`job-${i}`}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.08 + i * 0.08,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-4xl sm:text-5xl font-display font-black text-white uppercase leading-none tracking-tight"
                    style={{ display: 'inline-block' }}
                  >
                    {letter}
                  </motion.div>
                ))}

                {/* Thin divider between words */}
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 0.34, duration: 0.25 }}
                  className="w-px h-8 bg-slate-700 mx-1 self-center"
                  style={{ display: 'inline-block' }}
                />

                {/* "LEAK" — gradient */}
                {'LEAK'.split('').map((letter, i) => (
                  <motion.div
                    key={`leak-${i}`}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4 + i * 0.08,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-4xl sm:text-5xl font-display font-black uppercase leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"
                    style={{ display: 'inline-block' }}
                  >
                    {letter}
                  </motion.div>
                ))}

                {/* Cursor — fades out after sequence finishes */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 1, 0] }}
                  transition={{ delay: 1.2, duration: 0.4, times: [0, 0.5, 1] }}
                  className="text-4xl sm:text-5xl font-display font-black text-blue-400 leading-none pb-0.5"
                  style={{ display: 'inline-block' }}
                >
                  _
                </motion.div>
              </div>

              {/* ── 3-Pillar intelligence badge strip ── */}
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    icon: Activity,
                    label: 'Demand Forecasting',
                    sub: '18–72h early signal',
                    color: 'text-blue-400',
                    border: 'border-blue-500/25',
                    bg: 'bg-blue-500/8',
                    dot: 'bg-blue-500',
                  },
                  {
                    icon: Target,
                    label: 'Competitor Intelligence',
                    sub: 'Ad spend + CPC gaps',
                    color: 'text-indigo-400',
                    border: 'border-indigo-500/25',
                    bg: 'bg-indigo-500/8',
                    dot: 'bg-indigo-500',
                  },
                  {
                    icon: Cpu,
                    label: 'Instant Campaign Deploy',
                    sub: 'Google Ads + LSA ready',
                    color: 'text-emerald-400',
                    border: 'border-emerald-500/25',
                    bg: 'bg-emerald-500/8',
                    dot: 'bg-emerald-400',
                    live: true,
                  },
                ].map((pill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.08, duration: 0.4 }}
                    className={`flex items-center gap-2.5 ${pill.bg} border ${pill.border} px-3.5 py-2 rounded-xl`}
                  >
                    {/* Live dot on last pill */}
                    {pill.live ? (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${pill.dot} shrink-0`} />
                    )}
                    <pill.icon className={`h-3.5 w-3.5 ${pill.color} shrink-0`} />
                    <div className="leading-none">
                      <span className={`text-[11px] font-mono font-black ${pill.color} uppercase tracking-wider block`}>
                        {pill.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                        {pill.sub}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.05] text-white">
                  Strike First.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">
                    Win Every Time.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
                  JobLeak gives contractors a full intelligence edge —{' '}
                  <span className="text-blue-400 font-bold">demand forecasting</span>,{' '}
                  <span className="text-indigo-400 font-bold">competitor spend tracking</span>, and{' '}
                  <span className="text-emerald-400 font-bold">instant campaign deployment</span>{' '}
                  — so you reach homeowners 18–72 hours before anyone else reacts.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onRouteChange('#scan'); window.location.hash = '#scan'; }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="relative z-10">Run Free Market Scan</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onRouteChange('#pricing'); window.location.hash = '#pricing'; }}
                  className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
                >
                  View Pricing
                </motion.button>
              </div>

              {/* Signal bullets */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-6 max-w-xl">
                {[
                  'Weather + permit demand spikes',
                  'Competitor budget exhaustion',
                  'Real-time search intent scoring',
                  'Ready-to-deploy campaigns',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded bg-blue-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — interactive panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Live Intelligence Preview
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-400 rounded uppercase tracking-widest">
                    Online
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Region</label>
                      <select
                        value={previewCity}
                        onChange={e => setPreviewCity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-[10px] font-mono focus:outline-none focus:border-blue-600 transition-all"
                      >
                        {Object.keys(MarketProfiles).map(key => (
                          <option key={key} value={MarketProfiles[key].name} className="bg-slate-950">
                            {MarketProfiles[key].name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Trade</label>
                      <select
                        value={previewIndustry}
                        onChange={e => setPreviewIndustry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-[10px] font-mono focus:outline-none focus:border-blue-600 transition-all"
                      >
                        {['HVAC','Roofing','Plumbing','Electrical','Pest Control','Garage Door'].map(t => (
                          <option key={t} value={t} className="bg-slate-950">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Service Focus</label>
                    <input
                      type="text"
                      value={serviceText}
                      onChange={e => setServiceText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-blue-600 transition-all font-mono"
                    />
                  </div>

                  {/* Live metrics */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Signal Index</span>
                      <span className="text-xl font-display font-black text-blue-400">{previewIntentScore}<span className="text-sm text-slate-600 font-normal"> / 95</span></span>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-mono">
                      {[
                        { label: 'Market Growth',     value: `+${previewProfile.growth}%`,       color: 'text-emerald-400' },
                        { label: 'Permit Velocity',   value: `${previewProfile.permitHeat}/mo`,   color: 'text-blue-400' },
                        { label: 'CPC Stress',        value: cpcTier,                             color: cpcTier === 'High' ? 'text-orange-400' : 'text-blue-400' },
                        { label: 'Competitor Density',value: competition,                         color: competition === 'High' ? 'text-red-400' : 'text-slate-300' },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between">
                          <span className="text-slate-500">{row.label}</span>
                          <span className={`font-bold ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onStartInstantScan(previewCity, previewIndustry, serviceText)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="relative z-10">Run Live Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-slate-800 bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-12 lg:gap-20">

            {/* Left label */}
            <div className="md:w-48 shrink-0">
              <p className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-2">How It Works</p>
              <h2 className="text-2xl font-display font-black text-white leading-tight">
                Three steps to your next job
              </h2>
            </div>

            {/* Steps */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-800 rounded-2xl overflow-hidden border border-slate-800">
              {[
                {
                  step: '01',
                  icon: Activity,
                  title: 'Intelligence fires first',
                  desc: 'Weather events, permit velocity spikes, seasonal demand curves, and Reddit community signals all feed the engine — 24/7.',
                  accent: 'text-blue-400',
                  bg: 'bg-blue-500/5',
                },
                {
                  step: '02',
                  icon: Target,
                  title: 'Market gets scored',
                  desc: 'Competitor ad budgets, CPC exhaustion windows, search intent density, and local demand pressure are calculated in real time.',
                  accent: 'text-indigo-400',
                  bg: 'bg-indigo-500/5',
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'You deploy and win',
                  desc: 'Download your Google Ads campaign, LSA checklist, and email templates — live and in market before competitors even notice the shift.',
                  accent: 'text-emerald-400',
                  bg: 'bg-emerald-500/5',
                },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`${s.bg} bg-slate-900 p-8 flex flex-col gap-4`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-black text-slate-600">{s.step}</span>
                    <div className={`w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center`}>
                      <s.icon className={`h-4 w-4 ${s.accent}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-display font-black text-white text-base mb-1.5`}>{s.title}</h3>
                    <p className="text-slate-500 text-xs font-mono leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. METRICS STRIP ───────────────────────────────────────────────── */}
      <section className="bg-slate-900/50 border-b border-slate-800 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '142,842', label: 'Live ingestion feeds',    color: 'text-blue-400' },
              { value: '98.4%',   label: 'Forecast accuracy',       color: 'text-white' },
              { value: '$3.4K',   label: 'Avg ad waste saved / mo', color: 'text-blue-400' },
              { value: '18–72h',  label: 'Lead time advantage',     color: 'text-orange-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="space-y-1"
              >
                <p className={`text-3xl sm:text-4xl font-display font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. COMPARISON TABLE ────────────────────────────────────────────── */}
      <section className="py-24 border-b border-slate-800 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/20 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-5">
              Competitive Analysis
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight mb-4">
              Why Contractors Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">JobLeak</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Every alternative costs more, delivers less, and puts you in a race against four other contractors for the same homeowner.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="overflow-x-auto rounded-2xl border border-slate-800"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest w-52">Feature</th>
                  <th className="px-6 py-5 bg-gradient-to-b from-blue-600/20 to-indigo-600/10 border-x border-blue-500/30 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-white font-display font-black text-base">JobLeak</span>
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-mono font-black rounded uppercase tracking-widest">Recommended</span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center"><span className="text-slate-400 font-bold text-sm">HomeAdvisor / Angi</span></th>
                  <th className="px-6 py-5 text-center"><span className="text-slate-400 font-bold text-sm">Cold Calling</span></th>
                  <th className="px-6 py-5 text-center"><span className="text-slate-400 font-bold text-sm">DIY Google Ads</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { feature: 'Monthly Cost',         jobleak: '$99–$299 flat',              ha: '$120–$180 per lead',      cold: '$2K–$5K/mo salary',     diy: '$500–$3K+ ad spend',      hl: true  },
                  { feature: 'Lead Exclusivity',      jobleak: '100% exclusive to you',       ha: 'Sold to 4–5 contractors', cold: 'Manual outreach only',  diy: 'Shared auction — anyone', hl: true  },
                  { feature: 'Lead Timing',           jobleak: '18–72h before demand peaks',  ha: '24–48h after homeowner',  cold: 'No intent signal',      diy: 'Reactive — after search', hl: true  },
                  { feature: 'Weather Intelligence',  jobleak: 'Real-time NWS + Open-Meteo',  ha: 'None',                    cold: 'None',                  diy: 'None',                    hl: true  },
                  { feature: 'Campaign Generation',   jobleak: 'Google Ads + LSA + Email',    ha: 'Not included',            cold: 'Not included',          diy: 'Hours of manual work',    hl: true  },
                  { feature: 'Competitor Intel',      jobleak: 'Local ad spend estimates',     ha: 'None',                    cold: 'None',                  diy: 'Manual research only',    hl: false },
                  { feature: 'Community Signals',     jobleak: 'Live homeowner intent posts',  ha: 'None',                    cold: 'None',                  diy: 'None',                    hl: true  },
                  { feature: 'Setup Time',            jobleak: 'Under 5 minutes',              ha: '1–3 days approval',       cold: '2–4 weeks hiring',      diy: 'Days of learning curve',  hl: true  },
                  { feature: 'Breakeven',             jobleak: '1 job = months covered',       ha: '8–10 leads to break even',cold: '15–20 calls to close 1',diy: '$400–$800 per lead',      hl: true  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{row.feature}</td>
                    <td className="px-6 py-4 bg-blue-600/5 border-x border-blue-500/20 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-emerald-400" />
                        </span>
                        <span className={`text-xs font-bold ${row.hl ? 'text-white' : 'text-slate-300'}`}>{row.jobleak}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-slate-500">{row.ha}</td>
                    <td className="px-6 py-4 text-center text-xs text-slate-500">{row.cold}</td>
                    <td className="px-6 py-4 text-center text-xs text-slate-500">{row.diy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl"
          >
            <div>
              <p className="text-white font-display font-black text-lg">Stop paying per lead. Start owning your market.</p>
              <p className="text-slate-500 text-sm font-mono mt-0.5">Flat monthly rate. No per-lead fees. No contracts. Cancel anytime.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onRouteChange('#pricing'); window.location.hash = '#pricing'; }}
              className="shrink-0 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center gap-2.5 group relative overflow-hidden shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative z-10">View Pricing</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─── 5. TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-slate-800 relative z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg mb-5">
              <div className="flex -space-x-1">
                {['bg-blue-500','bg-indigo-500','bg-emerald-500'].map((c, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-slate-900`} />
                ))}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Verified Contractor Reviews</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight mb-3">
              Contractors Who{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Strike First</span>
            </h2>
            <p className="text-slate-400 text-base font-mono max-w-xl mx-auto">
              Real results from contractors using JobLeak to win high-urgency jobs before competition reacts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                quote: "I ran JobLeak during a freeze warning in Denver. By 7 AM I had 14 calls for burst pipes. Competitors didn't know what was happening until noon. Closed $31,000 in two days.",
                name: 'Marcus T.',
                role: 'Owner, Apex Plumbing & Drain',
                city: 'Denver, CO',
                trade: 'Plumbing',
                result: '$31K in 48hrs',
                border: 'border-blue-500/30',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              },
              {
                quote: "The competitor budget tracker told me exactly when the other AC guys went offline. My cost per lead dropped from $180 to $44. This pays for itself 10 times over.",
                name: 'Sandra R.',
                role: 'Operations Director, CoolFlow HVAC',
                city: 'Phoenix, AZ',
                trade: 'HVAC',
                result: 'CPL dropped to $44',
                border: 'border-emerald-500/30',
                badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                featured: true,
              },
              {
                quote: "After a Houston hailstorm we deployed ads in 8 minutes using the campaign engine. Weather-triggered headlines converted at 18%. We booked 22 roof inspections before lunch.",
                name: 'Devon W.',
                role: 'CEO, Lone Star Roofing Co.',
                city: 'Houston, TX',
                trade: 'Roofing',
                result: '22 jobs before noon',
                border: 'border-indigo-500/30',
                badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative bg-slate-900 border ${t.border} rounded-2xl p-7 flex flex-col justify-between ${t.featured ? 'ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-500/5' : ''}`}
              >
                {t.featured && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-mono font-black uppercase tracking-widest rounded-full">Top Result</span>
                  </div>
                )}
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <blockquote className="text-slate-300 text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</blockquote>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold mb-5 w-fit ${t.badge}`}>
                  <TrendingUp className="h-3 w-3" />
                  {t.result}
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs font-mono">{t.role}</div>
                    <div className="text-slate-600 text-xs font-mono">{t.city}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold ${t.badge}`}>{t.trade}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="border border-slate-800 rounded-2xl bg-slate-900/50 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="hidden sm:flex items-center gap-10">
              {[
                { value: '4,820+', label: 'Active contractors' },
                { value: '97.4%',  label: 'Retention rate' },
                { value: '$3.4K',  label: 'Avg monthly savings' },
                { value: '18–72h', label: 'Lead time advantage' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-display font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onRouteChange('#scan'); window.location.hash = '#scan'; }}
              className="shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center gap-2 group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative z-10">Start Free Audit</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─── 6. FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-20 relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none saas-grid-bg" />
        <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight">
            Stop waiting for dry weeks.<br />Trigger storms.
          </h3>
          <p className="text-blue-100 max-w-xl mx-auto leading-relaxed text-sm font-mono">
            Run a 100% free contractor market scan for your city. See active demand signals, competitor gaps, and your first campaign — in under 5 minutes.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onRouteChange('#scan'); window.location.hash = '#scan'; }}
            className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-display font-black uppercase tracking-widest rounded-xl shadow-2xl transition-all inline-flex items-center gap-2 text-sm border border-slate-800 hover:border-slate-700 cursor-pointer group"
          >
            <span>Build Free Regional Scan</span>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
          {/* Trust micro-strip */}
          <div className="flex items-center justify-center gap-6 pt-2">
            {[
              { icon: ShieldCheck, label: 'SSL Encrypted' },
              { icon: Database,    label: 'No data sold' },
              { icon: Radio,       label: 'Public APIs only' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-blue-200/60">
                <Icon className="h-3 w-3" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
