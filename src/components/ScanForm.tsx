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
  Sparkles, 
  MapPin, 
  AlertCircle, 
  ArrowRight, 
  Zap,
  Target,
  TrendingUp,
  CheckCircle
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/30 px-5 py-2.5 rounded-full backdrop-blur-md shadow-xl mb-6"
          >
            <Zap className="h-5 w-5 text-blue-400 animate-pulse" />
            <span className="text-sm font-mono font-black tracking-widest text-blue-400 uppercase">
              Deep Market Audit™
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white mb-6 leading-tight"
          >
            Find Leads{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">
              18-72 Hours Early
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Enter your market details below. Our AI analyzes weather triggers, search intent, and competitor density in real-time.
          </motion.p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <form onSubmit={handleScan} className="relative z-10 space-y-8">
            
            {/* Quick Presets */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Quick Start Presets
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quickPresets.map((preset, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => applyPreset(preset)}
                    className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all text-left group"
                  >
                    <div className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {preset.label}
                    </div>
                    <div className="text-xs text-slate-400">
                      {preset.city} • {preset.industry}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* State Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  Target State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-base px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  disabled={scanning}
                >
                  {StatesList.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-400" />
                  Target City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-base px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  disabled={scanning}
                >
                  {StatesList.find(s => s.code === selectedState)?.cities.map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>

              {/* Industry Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-base px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
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

              {/* Service Type */}
              <div>
                <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  Service Type
                </label>
                <input
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Emergency AC Repair"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-base px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-slate-500"
                  disabled={scanning}
                />
              </div>
            </div>

            {/* Scanning Progress */}
            {scanning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border border-blue-500/30 rounded-2xl p-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-bold text-lg">Analyzing Market...</span>
                  <span className="text-blue-400 font-mono font-bold text-2xl">{progress}%</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"
                  />
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  {progress >= 20 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Weather data retrieved
                    </div>
                  )}
                  {progress >= 40 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Search intent analyzed
                    </div>
                  )}
                  {progress >= 60 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Competitor density mapped
                    </div>
                  )}
                  {progress >= 80 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Opportunity score calculated
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={scanning}
              whileHover={!scanning ? { scale: 1.02 } : {}}
              whileTap={!scanning ? { scale: 0.98 } : {}}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-display font-black text-lg uppercase tracking-wider rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:cursor-not-allowed"
            >
              {/* Shimmer effect */}
              {!scanning && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )}
              <span className="relative z-10 flex items-center gap-3">
                {scanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scanning Market...
                  </>
                ) : (
                  <>
                    <Scan className="h-6 w-6" />
                    Start Deep Market Audit™
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>

          </form>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400"
        >
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Real-time weather data
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-400" />
            AI-powered analysis
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-indigo-400" />
            100% free audit
          </span>
        </motion.div>
      </div>
    </div>
  );
}
