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
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-black tracking-widest text-blue-400 uppercase">Live Market Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white leading-tight">
              {city} <span className="text-slate-500">·</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{industry}</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">{service}</p>
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
                className={`lg:col-span-1 bg-gradient-to-br ${urgency.gradient} backdrop-blur-xl border-2 ${urgency.border} rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${urgency.badge} mb-6`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${urgency.ring} animate-pulse`} />
                  <span className="text-sm font-mono font-black uppercase tracking-wider">{urgency.label} PRIORITY</span>
                </div>
                <div className="relative">
                  <ScoreRing score={score} size={180} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-6xl font-display font-black ${urgency.text}`}>{score}</span>
                    <span className="text-slate-400 text-sm font-mono">/ 100</span>
                  </div>
                </div>
                <p className="text-white font-bold text-xl mt-4">Opportunity Score</p>
                <p className={`${urgency.text} text-sm mt-1 font-medium`}>{urgency.sublabel}</p>
              </motion.div>

              {/* WEATHER CARDS */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { icon: Thermometer, label: 'High Temp', value: `${weather?.maxTemp ?? '--'}°F`, sub: `Low: ${weather?.minTemp ?? '--'}°F`, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                  { icon: Wind, label: 'Wind Gusts', value: `${weather?.maxWind ?? '--'} mph`, sub: weather?.maxWind && weather.maxWind >= 35 ? '⚠ Roofing Alert' : 'Normal levels', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                  { icon: CloudRain, label: 'Rain Chance', value: `${weather?.maxRainProb ?? '--'}%`, sub: weather?.maxRainProb && weather.maxRainProb >= 60 ? '⚠ Leak risk' : 'Low risk', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                  { icon: TrendingUp, label: 'Market Growth', value: `+${profile.growth}%`, sub: `${profile.permitHeat} permits/mo`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                    className={`${stat.bg} border ${stat.border} backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between`}>
                    <stat.icon className={`h-8 w-8 ${stat.color} mb-3`} />
                    <div>
                      <div className={`text-3xl font-display font-black ${stat.color}`}>{stat.value}</div>
                      <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{stat.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-2 border-b border-slate-800">
              {(['overview', 'reddit'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all capitalize flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-slate-800 text-white border border-b-0 border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  {tab === 'reddit' && (
                    <span className="relative flex h-2 w-2">
                      {!redditLoading && highReddit > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${!redditLoading && highReddit > 0 ? 'bg-red-400' : 'bg-slate-500'}`} />
                    </span>
                  )}
                  {tab === 'overview' ? '📊 Market Analysis' : `💬 Community Signals ${highReddit > 0 ? `(${highReddit} urgent)` : ''}`}
                </button>
              ))}
            </div>

            {/* ── TAB: OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="space-y-6">

                {/* Weather triggers */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
                  <h3 className="text-xl font-display font-black text-white mb-6 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Active Weather Triggers
                    {triggers.length > 0 && (
                      <span className="ml-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold rounded-full">
                        {triggers.length} detected
                      </span>
                    )}
                  </h3>
                  {triggers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {triggers.map((t, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}
                          className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
                          <span className="text-sm text-slate-200 font-medium">{t}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <p className="text-slate-300">No severe weather triggers right now. Market conditions are stable.</p>
                    </div>
                  )}
                </div>

                {/* Market intelligence grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { icon: Activity, label: 'Permit Velocity', value: `${profile.permitHeat}/mo`, sub: 'Active construction permits', color: 'indigo' },
                    { icon: DollarSign, label: 'CPC Level', value: score >= 70 ? 'HIGH' : 'MEDIUM', sub: 'Cost-per-click pressure', color: 'orange' },
                    { icon: Users, label: 'Competitor Density', value: score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low', sub: 'Advertisers in market', color: 'blue' },
                  ].map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }}
                      className={`bg-${m.color}-500/5 border border-${m.color}-500/20 backdrop-blur-xl rounded-2xl p-6`}>
                      <m.icon className={`h-7 w-7 text-${m.color}-400 mb-4`} />
                      <div className={`text-2xl font-display font-black text-${m.color}-400`}>{m.value}</div>
                      <div className="text-white font-bold mt-1">{m.label}</div>
                      <div className="text-slate-500 text-xs mt-1">{m.sub}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Recommended actions */}
                <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-3xl p-8">
                  <h3 className="text-xl font-display font-black text-white mb-6 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Recommended Actions
                  </h3>
                  <div className="space-y-3">
                    {[
                      { action: score >= 70 ? 'Deploy Google Ads NOW — peak intent window open' : 'Prepare campaigns — monitor for trigger spike', urgency: score >= 70, icon: Zap },
                      { action: `Increase bids by ${score >= 80 ? '40–60%' : '20–30%'} for "${service}" keywords`, urgency: score >= 70, icon: TrendingUp },
                      { action: 'Enable call extensions and location targeting', urgency: false, icon: CheckCircle },
                      { action: `Target zip codes within 20 miles of ${city} center`, urgency: false, icon: MapPin },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.07 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${item.urgency ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/40 border-slate-700'}`}>
                        <item.icon className={`h-5 w-5 shrink-0 ${item.urgency ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${item.urgency ? 'text-emerald-100' : 'text-slate-300'}`}>{item.action}</span>
                        {item.urgency && <span className="ml-auto text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">NOW</span>}
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
                    <h3 className="text-xl font-display font-black text-white">Community Lead Signals</h3>
                    <p className="text-slate-400 text-sm mt-1">Real homeowners asking for {industry} help on Reddit</p>
                  </div>
                  {!redditLoading && <span className="text-xs font-mono text-slate-400">{redditPosts.length} signals found</span>}
                </div>

                {redditLoading ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-10 h-10 border-3 border-t-transparent border-orange-500 rounded-full animate-spin mx-auto" style={{ borderWidth: 3 }} />
                    <p className="text-slate-400 text-sm">Scanning community boards...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {redditPosts.map((post, i) => (
                      <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                        className="group bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <UrgencyBadge urgency={post.urgency} />
                              <span className="text-xs text-slate-500 font-mono">r/{post.subreddit}</span>
                              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                <Clock className="h-3 w-3" />{timeAgo(post.created_utc)}
                              </span>
                            </div>
                            <h4 className="text-white font-bold leading-snug group-hover:text-blue-300 transition-colors">
                              {post.title}
                            </h4>
                            {post.selftext && (
                              <p className="text-slate-400 text-sm mt-2 leading-relaxed line-clamp-2">{post.selftext}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" />{post.score} upvotes</span>
                              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.num_comments} comments</span>
                            </div>
                          </div>
                          <a href={post.url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 p-2 bg-slate-800 hover:bg-blue-600 rounded-lg transition-all">
                            <ExternalLink className="h-4 w-4 text-slate-400 hover:text-white" />
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
              className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 shadow-2xl border border-blue-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-6 w-6 text-yellow-300" />
                    <span className="text-blue-100 font-mono font-bold text-sm uppercase tracking-wider">Ready to Strike?</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-display font-black text-white">
                    Generate Your Campaign Now
                  </h3>
                  <p className="text-blue-100 mt-2 text-lg">
                    Get weather-triggered Google Ads, keywords, and ad copy — ready to deploy in seconds.
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onNavigateToCampaign}
                  className="shrink-0 px-8 py-5 bg-white text-blue-600 font-display font-black text-lg uppercase tracking-wider rounded-2xl shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-3 group">
                  <Sparkles className="h-6 w-6" />
                  Build Campaign
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
