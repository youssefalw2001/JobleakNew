/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SIMPLIFIED RISK SCANNER - Million Dollar Design
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Scan, 
  MapPin, 
  ArrowRight, 
  Zap,
  TrendingUp,
  CheckCircle,
  Activity
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
  const [progress, setProgress] = useState(0);

  // Auto-update cities when state changes
  useEffect(() => {
    const list = StatesList.find(s => s.code === selectedState)?.cities || [];
    if (list.length > 0 && !list.includes(city)) {
      setCity(list[0]);
    }
  }, [selectedState]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    setProgress(0);

    // Animated progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    // Simulate scan delay for effect
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onScanComplete(city, industry, serviceType);
        window.location.hash = '#radar';
        onRouteChange('#radar');
      }, 500);
    }, 1500);
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
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

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

            {/* Scanning Progress */}
            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-950 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white font-mono">Running Deep Market Audit™</span>
                  <span className="text-blue-400 font-mono font-bold text-sm">{progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { threshold: 20, label: 'Weather data retrieved' },
                    { threshold: 40, label: 'Search intent analyzed' },
                    { threshold: 60, label: 'Competitor density mapped' },
                    { threshold: 80, label: 'Opportunity score calculated' },
                  ].map(step => progress >= step.threshold && (
                    <div key={step.threshold} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="font-mono">{step.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Scanning Market...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    Initialize Deep Market Audit™
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
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
