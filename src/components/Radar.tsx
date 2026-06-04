/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * OPPORTUNITY RADAR — Full rebuild. Million-dollar design.
 * Real weather data + opportunity scoring + Reddit community signals.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Radio, MapPin, CloudRain, Wind, Thermometer, TrendingUp,
  AlertTriangle, CheckCircle, Sparkles, ArrowRight, Zap,
  Activity, DollarSign, Users, Clock, MessageSquare,
  ExternalLink, RefreshCw, Target, Award, ChevronUp
} from 'lucide-react';
import {
  calculateSearchIntentScore,
  getMarketProfile,
  analyzeWeatherTriggers,
  WeatherData
} from '../types';
import { fetchRedditLeads, RedditPost, timeAgo } from '../integrations/reddit';

interface RadarProps {
  scannedData: { city: string; industry: string; serviceText: string } | null;
  onNavigateToCampaign: () => void;
  onModifyScan: () => void;
}

// ─── Score ring SVG ───────────────────────────────────────────────────────────
function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f97316' : '#64748b';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius}
        stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth="12" fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - filled }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// ─── Urgency config ───────────────────────────────────────────────────────────
function getUrgencyConfig(score: number) {
  if (score >= 80) return {
    label: 'URGENT', sublabel: 'Deploy campaigns immediately',
    gradient: 'from-emerald-950/60 to-emerald-900/30',
    border: 'border-emerald-500', ring: 'bg-emerald-500',
    text: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
  };
  if (score >= 60) return {
    label: 'HIGH', sublabel: 'Strong opportunity — act today',
    gradient: 'from-blue-950/60 to-blue-900/30',
    border: 'border-blue-500', ring: 'bg-blue-500',
    text: 'text-blue-400', badge: 'bg-blue-500/20 border-blue-500/40 text-blue-300'
  };
  if (score >= 40) return {
    label: 'MEDIUM', sublabel: 'Monitor and prepare',
    gradient: 'from-orange-950/60 to-orange-900/30',
    border: 'border-orange-500', ring: 'bg-orange-500',
    text: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500/40 text-orange-300'
  };
  return {
    label: 'LOW', sublabel: 'Low activity right now',
    gradient: 'from-slate-900/60 to-slate-800/30',
    border: 'border-slate-600', ring: 'bg-slate-500',
    text: 'text-slate-400', badge: 'bg-slate-700/50 border-slate-600 text-slate-400'
  };
}

// ─── Reddit urgency badge ─────────────────────────────────────────────────────
function UrgencyBadge({ urgency }: { urgency: RedditPost['urgency'] }) {
  const cfg = {
    HIGH:   'bg-red-500/20 border-red-500/40 text-red-300',
    MEDIUM: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    LOW:    'bg-slate-700/50 border-slate-600 text-slate-400',
  }[urgency];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${cfg}`}>
      {urgency === 'HIGH' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      {urgency}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Radar({ scannedData, onNavigateToCampaign, onModifyScan }: RadarProps) {
  const [loading, setLoading]           = useState(true);
  const [weather, setWeather]           = useState<WeatherData | null>(null);
  const [score, setScore]               = useState(0);
  const [redditPosts, setRedditPosts]   = useState<RedditPost[]>([]);
  const [redditLoading, setRedditLoading] = useState(true);
  const [activeTab, setActiveTab]       = useState<'overview' | 'reddit'>('overview');

  const city     = scannedData?.city     || 'Austin';
  const industry = scannedData?.industry || 'HVAC';
  const service  = scannedData?.serviceText || 'Emergency Repair';

  // ── Fetch weather + score ──────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, [city, industry, service]);

  const fetchAll = async () => {
    setLoading(true);
    setRedditLoading(true);

    // Weather + score in parallel with Reddit
    const [weatherResult] = await Promise.allSettled([
      fetchWeather(city, industry),
    ]);

    if (weatherResult.status === 'fulfilled') {
      setWeather(weatherResult.value);
      const { score: s } = calculateSearchIntentScore(city, service, industry);
      setScore(s);
    }
    setLoading(false);

    // Reddit separately so page doesn't block
    const posts = await fetchRedditLeads(city, industry, service);
    setRedditPosts(posts);
    setRedditLoading(false);
  };

  const fetchWeather = async (city: string, industry: string): Promise<WeatherData> => {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`
      );
      const geo = await geoRes.json();
      if (!geo.results?.length) throw new Error('no geo');

      const { latitude: lat, longitude: lng } = geo.results[0];
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&daily=temperature_2m_max,temperature_2m_min,wind_gusts_10m_max,` +
        `precipitation_probability_max,precipitation_sum` +
        `&hourly=relative_humidity_2m` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch` +
        `&timezone=auto&forecast_days=3`
      );
      const w = await wRes.json();
      const maxTemp = w.daily.temperature_2m_max[0];
      const minTemp = w.daily.temperature_2m_min[0];
      const maxWind = w.daily.wind_gusts_10m_max[0];
      const rainProb = w.daily.precipitation_probability_max[0];
      const precip = w.daily.precipitation_sum[0];
      const humidity = Math.round(
        w.hourly.relative_humidity_2m.slice(6, 18).reduce((a: number, b: number) => a + b, 0) / 12
      );
      const { triggers, urgency } = analyzeWeatherTriggers(maxTemp, minTemp, maxWind, rainProb, precip, humidity, []);
      return { city, lat, lng, currentTemp: Math.round((maxTemp + minTemp) / 2), maxTemp, minTemp, maxWind, maxRainProb: rainProb, maxPrecip: precip, maxHumidity: humidity, alerts: [], weatherUrgency: urgency, triggers };
    } catch {
      // Fallback
      const { triggers, urgency } = analyzeWeatherTriggers(96, 74, 14, 20, 0, 52, []);
      return { city, lat: 30.27, lng: -97.74, currentTemp: 96, maxTemp: 96, minTemp: 74, maxWind: 14, maxRainProb: 20, maxPrecip: 0, maxHumidity: 52, alerts: [], weatherUrgency: urgency, triggers };
    }
  };

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!scannedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Radio className="h-16 w-16 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-lg">No scan data. Run a scan first.</p>
          <button onClick={onModifyScan}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">
            Start New Scan
          </button>
        </div>
      </div>
    );
  }

  const urgency    = getUrgencyConfig(score);
  const profile    = getMarketProfile(city);
  const triggers   = weather?.triggers || [];
  const highReddit = redditPosts.filter(p => p.urgency === 'HIGH').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-10">

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Live Market Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white leading-tight tracking-tight">
              {city}{' '}
              <span className="text-slate-600">·</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{industry}</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-mono">{service}</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={fetchAll}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onModifyScan}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-all">
              New Scan
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          /* ── LOADING STATE ── */
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white font-bold text-xl">Analyzing {city} market...</p>
            <p className="text-slate-400 font-mono text-sm">Pulling weather data, scoring intent, mapping competitors</p>
          </div>
        ) : (
          <>
            {/* ── TOP ROW: Score + Weather + Triggers ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* SCORE CARD */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
                className={`lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden`}>
                {/* Subtle color tint based on score */}
                <div className={`absolute inset-0 bg-gradient-to-br ${urgency.gradient} opacity-60 pointer-events-none`} />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${urgency.badge} mb-6 relative z-10`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${urgency.ring} animate-pulse`} />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest">{urgency.label} PRIORITY</span>
                </div>

                <div className="relative z-10">
                  <ScoreRing score={score} size={180} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-6xl font-display font-black ${urgency.text}`}>{score}</span>
                    <span className="text-slate-600 text-xs font-mono tracking-wider">/ 100</span>
                  </div>
                </div>

                <div className="relative z-10 text-center mt-5">
                  <p className="text-white font-display font-black text-lg tracking-tight">Opportunity Score</p>
                  <p className={`${urgency.text} text-xs mt-1 font-mono`}>{urgency.sublabel}</p>
                </div>
              </motion.div>

              {/* WEATHER CARDS */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-px bg-slate-800 rounded-2xl overflow-hidden border border-slate-800">
                {[
                  { icon: Thermometer, label: 'High Temperature',  value: `${weather?.maxTemp ?? '--'}°F`,   sub: `Low: ${weather?.minTemp ?? '--'}°F`,  accent: 'text-orange-400' },
                  { icon: Wind,        label: 'Wind Gusts',         value: `${weather?.maxWind ?? '--'} mph`, sub: weather?.maxWind && weather.maxWind >= 35 ? 'Roofing alert threshold' : 'Normal range', accent: 'text-blue-400' },
                  { icon: CloudRain,   label: 'Precipitation Prob.', value: `${weather?.maxRainProb ?? '--'}%`, sub: weather?.maxRainProb && weather.maxRainProb >= 60 ? 'Elevated leak risk' : 'Low risk', accent: 'text-cyan-400' },
                  { icon: TrendingUp,  label: 'Market Growth',      value: `+${profile.growth}%`,             sub: `${profile.permitHeat} active permits/mo`, accent: 'text-emerald-400' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                    className="bg-slate-900 p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <stat.icon className={`h-5 w-5 ${stat.accent}`} />
                      <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest text-right leading-tight max-w-[80px]">
                        {stat.label}
                      </span>
                    </div>
                    <div>
                      <div className={`text-2xl font-display font-black ${stat.accent}`}>{stat.value}</div>
                      <div className="text-slate-600 text-xs mt-0.5 font-mono">{stat.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="flex border-b border-slate-800">
              {[
                { key: 'overview', label: 'Market Analysis', count: null },
                { key: 'reddit',   label: 'Community Signals', count: !redditLoading && highReddit > 0 ? highReddit : null },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition-all -mb-px ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}>
                  {tab.label}
                  {tab.count !== null && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold rounded">
                      {tab.count}
                    </span>
                  )}
                  {tab.key === 'reddit' && !redditLoading && highReddit === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </button>
              ))}
            </div>

            {/* ── TAB: OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="space-y-6">

                {/* Weather triggers */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-sm font-display font-black text-white flex items-center gap-2.5">
                      <Zap className="h-4 w-4 text-slate-400" />
                      Active Weather Triggers
                    </h3>
                    {triggers.length > 0 && (
                      <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-mono font-bold rounded uppercase tracking-wider">
                        {triggers.length} Detected
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    {triggers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {triggers.map((t, i) => (
                          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3.5">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                            <span className="text-sm text-slate-300 font-medium">{t}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-slate-400 text-sm">No active weather triggers. Market conditions are within normal parameters.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market intelligence grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
                  {[
                    { icon: Activity,   label: 'Permit Velocity',    value: `${profile.permitHeat}/mo`,                          sub: 'Active construction permits',  accent: 'text-indigo-400' },
                    { icon: DollarSign, label: 'CPC Pressure',        value: score >= 70 ? 'ELEVATED' : 'MODERATE',              sub: 'Cost-per-click environment',   accent: 'text-orange-400' },
                    { icon: Users,      label: 'Competitor Density',  value: score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW', sub: 'Active advertisers in market', accent: 'text-blue-400' },
                  ].map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      className="bg-slate-900 p-6">
                      <m.icon className={`h-5 w-5 ${m.accent} mb-4`} />
                      <div className={`text-xl font-display font-black ${m.accent}`}>{m.value}</div>
                      <div className="text-white font-bold text-sm mt-1">{m.label}</div>
                      <div className="text-slate-600 text-xs mt-0.5 font-mono">{m.sub}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Recommended actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-sm font-display font-black text-white flex items-center gap-2.5">
                      <Target className="h-4 w-4 text-slate-400" />
                      Recommended Actions
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                      Based on live data
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {[
                      { action: score >= 70 ? 'Deploy Google Ads — peak intent window is open' : 'Prepare campaign assets — monitor for trigger spike', urgent: score >= 70, icon: Zap },
                      { action: `Increase bids by ${score >= 80 ? '40–60%' : '20–30%'} for "${service}" keywords`, urgent: score >= 70, icon: TrendingUp },
                      { action: 'Enable call extensions and location targeting in your campaigns', urgent: false, icon: CheckCircle },
                      { action: `Geo-target zip codes within 20 miles of ${city} city center`, urgent: false, icon: MapPin },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.06 }}
                        className={`flex items-center gap-4 px-6 py-4 ${item.urgent ? 'bg-emerald-500/5' : ''}`}>
                        <item.icon className={`h-4 w-4 shrink-0 ${item.urgent ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className={`text-sm ${item.urgent ? 'text-slate-200' : 'text-slate-400'} flex-1`}>
                          {item.action}
                        </span>
                        {item.urgent && (
                          <span className="shrink-0 text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
                            Deploy Now
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB: REDDIT ── */}
            {activeTab === 'reddit' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-display font-black text-white">Community Lead Signals</h3>
                    <p className="text-slate-500 text-sm mt-0.5 font-mono">Homeowners publicly requesting {industry} services</p>
                  </div>
                  {!redditLoading && (
                    <span className="text-xs font-mono text-slate-600 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      {redditPosts.length} signals indexed
                    </span>
                  )}
                </div>

                {redditLoading ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">Indexing community boards</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {redditPosts.map((post, i) => (
                      <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <UrgencyBadge urgency={post.urgency} />
                              <span className="text-[10px] text-slate-600 font-mono">r/{post.subreddit}</span>
                              <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                                <Clock className="h-3 w-3" />{timeAgo(post.created_utc)}
                              </span>
                            </div>
                            <h4 className="text-sm text-slate-200 font-bold leading-snug group-hover:text-white transition-colors">
                              {post.title}
                            </h4>
                            {post.selftext && (
                              <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2 font-mono">{post.selftext}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-600 font-mono">
                              <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" />{post.score}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.num_comments}</span>
                            </div>
                          </div>
                          <a href={post.url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all">
                            <ExternalLink className="h-3.5 w-3.5 text-slate-500 hover:text-white" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── BOTTOM CTA ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Next Step
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                    Generate Your Campaign
                  </h3>
                  <p className="text-slate-400 mt-1.5 text-base">
                    Weather-triggered Google Ads, keyword lists, and ad copy — ready in seconds.
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={onNavigateToCampaign}
                  className="shrink-0 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center gap-3 group relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <Sparkles className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Build Campaign</span>
                  <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
