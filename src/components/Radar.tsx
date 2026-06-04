/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SIMPLIFIED OPPORTUNITY RADAR - Million Dollar Design
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Radio, 
  MapPin, 
  CloudRain, 
  Wind, 
  Thermometer, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Award,
  Activity,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import { calculateSearchIntentScore, getMarketProfile } from '../types';

interface RadarProps {
  scannedData: {
    city: string;
    industry: string;
    serviceText: string;
  } | null;
  onNavigateToCampaign: () => void;
  onModifyScan: () => void;
}

export default function Radar({ scannedData, onNavigateToCampaign, onModifyScan }: RadarProps) {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [opportunityScore, setOpportunityScore] = useState(0);

  useEffect(() => {
    if (scannedData) {
      fetchWeatherAndScore();
    }
  }, [scannedData]);

  const fetchWeatherAndScore = async () => {
    if (!scannedData) return;

    setLoading(true);
    try {
      // Fetch real weather data
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(scannedData.city)}&count=1&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude } = geoData.results[0];
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=5`;
        const weatherRes = await fetch(weatherUrl);
        const weather = await weatherRes.json();

        setWeatherData({
          maxTemp: weather.daily.temperature_2m_max[0],
          minTemp: weather.daily.temperature_2m_min[0],
          windSpeed: weather.daily.wind_speed_10m_max[0],
          rainProb: weather.daily.precipitation_probability_max[0]
        });

        // Calculate opportunity score
        const { score } = calculateSearchIntentScore(
          scannedData.city,
          scannedData.serviceText,
          scannedData.industry
        );
        setOpportunityScore(score);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Use fallback data
      setWeatherData({
        maxTemp: 95,
        minTemp: 72,
        windSpeed: 15,
        rainProb: 20
      });
      setOpportunityScore(78);
    } finally {
      setLoading(false);
    }
  };

  if (!scannedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No scan data available</p>
          <button
            onClick={onModifyScan}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl"
          >
            Start New Scan
          </button>
        </div>
      </div>
    );
  }

  const marketProfile = getMarketProfile(scannedData.city);
  const scoreColor = opportunityScore >= 80 ? 'emerald' : opportunityScore >= 60 ? 'blue' : opportunityScore >= 40 ? 'orange' : 'slate';
  const urgencyLevel = opportunityScore >= 80 ? 'URGENT' : opportunityScore >= 60 ? 'HIGH' : opportunityScore >= 40 ? 'MEDIUM' : 'LOW';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden py-20">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-500/30 px-5 py-2.5 rounded-full backdrop-blur-md shadow-xl mb-6">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-sm font-mono font-black tracking-widest text-emerald-400 uppercase">
              Live Market Intelligence
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-display font-black text-white mb-4">
            {scannedData.city} • {scannedData.industry}
          </h1>
          <p className="text-xl text-slate-300">
            Real-time opportunity analysis for {scannedData.serviceText}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-mono">Analyzing market data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Opportunity Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`bg-gradient-to-br from-${scoreColor}-950/50 to-${scoreColor}-900/30 backdrop-blur-xl border-2 border-${scoreColor}-500 rounded-3xl p-12 text-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              
              <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${scoreColor}-500/20 border border-${scoreColor}-500/30 rounded-full mb-6`}>
                  <span className={`w-3 h-3 rounded-full bg-${scoreColor}-500 animate-pulse`} />
                  <span className={`text-sm font-mono font-bold text-${scoreColor}-400 uppercase`}>
                    {urgencyLevel} PRIORITY
                  </span>
                </div>

                <div className="mb-6">
                  <div className={`text-8xl font-display font-black text-${scoreColor}-400 mb-2`}>
                    {opportunityScore}
                  </div>
                  <div className="text-2xl text-white font-bold">
                    Opportunity Score
                  </div>
                  <div className="text-slate-400 mt-2">
                    Out of 100 points
                  </div>
                </div>

                {opportunityScore >= 70 && (
                  <div className={`bg-${scoreColor}-500/10 border border-${scoreColor}-500/30 rounded-xl p-4 text-${scoreColor}-300 font-bold`}>
                    🚀 High-value opportunity detected! Deploy campaigns immediately.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Weather & Market Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Weather Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Thermometer className="h-8 w-8 text-orange-400" />
                  <span className="text-3xl font-bold text-white">{weatherData?.maxTemp}°F</span>
                </div>
                <div className="text-slate-400 text-sm">High Temperature</div>
                <div className="mt-2 text-xs text-slate-500">
                  Low: {weatherData?.minTemp}°F
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Wind className="h-8 w-8 text-blue-400" />
                  <span className="text-3xl font-bold text-white">{weatherData?.windSpeed}</span>
                </div>
                <div className="text-slate-400 text-sm">Wind Speed (mph)</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                  <span className="text-3xl font-bold text-white">+{marketProfile.growth}%</span>
                </div>
                <div className="text-slate-400 text-sm">Market Growth</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Activity className="h-8 w-8 text-indigo-400" />
                  <span className="text-3xl font-bold text-white">{marketProfile.permitHeat}</span>
                </div>
                <div className="text-slate-400 text-sm">Permit Activity</div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNavigateToCampaign}
                className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-lg uppercase tracking-wider rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="h-6 w-6" />
                  Generate Campaign
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onModifyScan}
                className="px-8 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-display font-bold text-lg uppercase tracking-wider rounded-xl transition-all"
              >
                New Scan
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
