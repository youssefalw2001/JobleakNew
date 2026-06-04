/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CAMPAIGN ENGINE — Full rebuild. Million-dollar design.
 * Google Ads generator + CSV export + Email templates + LSA checklist + Reddit leads.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download, Copy, CheckCircle, ArrowRight,
  Zap, Target, DollarSign, Mail, List, MessageSquare,
  ChevronDown, ChevronUp, ExternalLink, Clock,
  TrendingUp, AlertTriangle, Search, Users
} from 'lucide-react';
import {
  generateGoogleAdsCampaign,
  exportCampaignToCSV,
  generateEmailTemplate,
  getLSAChecklist,
  GoogleAdsCampaign
} from '../integrations/googleAds';
import { fetchRedditLeads, RedditPost, timeAgo } from '../integrations/reddit';

interface CampaignProps {
  scannedData: { city: string; industry: string; serviceText: string } | null;
  onNavigateToScan: () => void;
}

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'google-ads' | 'email' | 'lsa' | 'reddit';

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        copied ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
      }`}>
      {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

// ─── Ad group accordion ───────────────────────────────────────────────────────
function AdGroupCard({ group, index }: { group: GoogleAdsCampaign['adGroups'][0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const ad = group.ads[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.08 }}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-all text-left">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
            index === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            index === 1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>{index + 1}</div>
          <div>
            <div className="text-white font-bold">{group.name}</div>
            <div className="text-slate-400 text-xs mt-0.5">{group.keywords.length} keywords · CPC {group.suggestedCpcBid}</div>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-800">
            <div className="p-5 space-y-5">

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Target Keywords</span>
                  <CopyButton text={group.keywords.join('\n')} label="Copy All" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono rounded-lg">
                      +{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Negative Keywords */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-red-400" /> Negative Keywords
                  </span>
                  <CopyButton text={group.negativeKeywords.map(k => `-${k}`).join('\n')} label="Copy" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.negativeKeywords.slice(0, 8).map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
                      -{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ad Copy */}
              {ad && (
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Responsive Search Ad</span>
                    <CopyButton text={`Headlines:\n${ad.headlines.map(h => h.text).join('\n')}\n\nDescriptions:\n${ad.descriptions.map(d => d.text).join('\n')}`} label="Copy Ad" />
                  </div>

                  {/* Ad Preview */}
                  <div className="bg-white rounded-xl p-4 text-left">
                    <div className="text-xs text-slate-500 mb-1 font-sans">Ad · yourwebsite.com/{ad.path1}/{ad.path2}</div>
                    <div className="text-blue-700 font-bold text-base leading-tight font-sans">
                      {ad.headlines[0]?.text} | {ad.headlines[1]?.text} | {ad.headlines[2]?.text}
                    </div>
                    <div className="text-slate-600 text-sm mt-1.5 font-sans leading-relaxed">
                      {ad.descriptions[0]?.text}
                    </div>
                  </div>

                  {/* All headlines */}
                  <div>
                    <div className="text-xs text-slate-500 font-mono mb-2">All Headlines ({ad.headlines.length})</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ad.headlines.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-600 font-mono w-4 shrink-0">{i + 1}.</span>
                          <span className="text-slate-300 font-medium truncate">{h.text}</span>
                          <span className={`shrink-0 text-[10px] font-mono ${h.text.length <= 30 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {h.text.length}/30
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <div className="text-xs text-slate-500 font-mono mb-2">Descriptions ({ad.descriptions.length})</div>
                    <div className="space-y-2">
                      {ad.descriptions.map((d, i) => (
                        <div key={i} className="text-xs text-slate-300 bg-slate-900 rounded-lg p-3 leading-relaxed">
                          {d.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
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
export default function Campaign({ scannedData, onNavigateToScan }: CampaignProps) {
  const [activeTab, setActiveTab]       = useState<Tab>('google-ads');
  const [campaign, setCampaign]         = useState<GoogleAdsCampaign | null>(null);
  const [lsaChecklist, setLsaChecklist] = useState<{ item: string; completed: boolean }[]>([]);
  const [emailTemplate, setEmailTemplate] = useState<{ subject: string; body: string } | null>(null);
  const [redditPosts, setRedditPosts]   = useState<RedditPost[]>([]);
  const [redditLoading, setRedditLoading] = useState(true);
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [generating, setGenerating]     = useState(true);

  const city     = scannedData?.city     || 'Austin';
  const industry = scannedData?.industry || 'HVAC';
  const service  = scannedData?.serviceText || 'Emergency Repair';

  useEffect(() => {
    generateAll();
  }, [city, industry, service]);

  const generateAll = async () => {
    setGenerating(true);

    // Slight delay for animation effect
    await new Promise(r => setTimeout(r, 800));

    const newCampaign = generateGoogleAdsCampaign(city, industry, service, `Weather trigger detected in ${city}`);
    const checklist   = getLSAChecklist(industry);
    const email       = generateEmailTemplate(city, industry, service, `Active weather trigger in ${city}`);

    setCampaign(newCampaign);
    setLsaChecklist(checklist);
    setEmailTemplate(email);
    setGenerating(false);

    // Load Reddit async
    const posts = await fetchRedditLeads(city, industry, service);
    setRedditPosts(posts);
    setRedditLoading(false);
  };

  const handleDownloadCSV = () => {
    if (!campaign) return;
    const csv = exportCampaignToCSV(campaign);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `jobleak-${city}-${industry}-campaign.csv`.replace(/\s+/g, '-').toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 3000);
  };

  const toggleLSA = (i: number) => {
    setLsaChecklist(prev => prev.map((item, idx) => idx === i ? { ...item, completed: !item.completed } : item));
  };

  const highReddit = redditPosts.filter(p => p.urgency === 'HIGH').length;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'google-ads', label: 'Google Ads',      icon: Search },
    { id: 'email',      label: 'Email Template',  icon: Mail },
    { id: 'lsa',        label: 'LSA Checklist',   icon: List },
    { id: 'reddit',     label: 'Community Leads', icon: MessageSquare },
  ];

  // ── Guard ────────────────────────────────────────────────────────────────────
  if (!scannedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
            <Search className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-slate-400 text-lg">No scan data. Run a market scan first.</p>
          <button onClick={onNavigateToScan}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all text-sm uppercase tracking-wider">
            Start Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-8">

        {/* ── HEADER ── */}        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Campaign Engine</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white leading-tight tracking-tight">
              Campaign Ready{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                to Deploy
              </span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-mono">
              {city} · {industry} · {service}
            </p>
          </div>

          {/* Download CSV */}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleDownloadCSV}
            disabled={generating || !campaign}
            className={`shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl font-display font-black text-base uppercase tracking-wider shadow-xl transition-all ${
              csvDownloaded
                ? 'bg-emerald-600 text-white border border-emerald-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed'
            }`}>
            {csvDownloaded ? <CheckCircle className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            {csvDownloaded ? 'Downloaded!' : 'Download CSV'}
          </motion.button>
        </motion.div>

        {/* ── GENERATING STATE ── */}
        {generating ? (
          <div className="text-center py-28 space-y-5">
            <div className="w-12 h-12 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="text-white font-display font-black text-xl tracking-tight">Building Campaign Package</p>
            <div className="space-y-1.5 text-sm text-slate-500 font-mono max-w-xs mx-auto">
              <p>Generating weather-triggered ad copy</p>
              <p>Compiling keyword matrix</p>
              <p>Preparing deployment assets</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── METRICS BAR ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800 border border-slate-800 rounded-xl overflow-hidden">
              {[
                { icon: Target,      label: 'Ad Groups',           value: `${campaign?.adGroups.length || 3}` },
                { icon: Search,      label: 'Total Keywords',      value: `${campaign?.adGroups.reduce((s, g) => s + g.keywords.length, 0) || '--'}` },
                { icon: TrendingUp,  label: 'Est. Monthly Leads',  value: campaign?.estimatedMetrics.estimatedLeadsPerMonth || '--' },
                { icon: DollarSign,  label: 'Avg CPC Range',       value: campaign?.estimatedMetrics.cpc || '--' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-900 px-5 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <m.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-lg font-display font-black text-white">{m.value}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{m.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* ── TABS ── */}
            <div className="flex border-b border-slate-800">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all -mb-px ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'reddit' && !redditLoading && highReddit > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold rounded">
                      {highReddit}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── TAB: GOOGLE ADS ── */}
            {activeTab === 'google-ads' && campaign && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="space-y-6">

                {/* Campaign info banner */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Campaign Name</div>
                    <div className="text-white font-bold flex items-center gap-2 flex-wrap">
                      <span>{campaign.campaignName}</span>
                      <CopyButton text={campaign.campaignName} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm shrink-0">
                    {[
                      { label: 'Budget', value: campaign.budgetRecommendation },
                      { label: 'Bid Strategy', value: campaign.bidStrategy.split(' ').slice(0, 3).join(' ') },
                      { label: 'Targeting', value: campaign.targeting.radius + ' radius' },
                      { label: 'Schedule', value: campaign.targeting.schedule.split(',')[0] },
                    ].map((info, i) => (
                      <div key={i}>
                        <div className="text-slate-500 text-[10px] font-mono uppercase">{info.label}</div>
                        <div className="text-slate-200 font-medium text-xs mt-0.5">{info.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign negative keywords */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-bold text-white">Campaign-Level Negative Keywords</span>
                      <span className="text-xs text-slate-400">Block irrelevant traffic</span>
                    </div>
                    <CopyButton text={campaign.campaignNegativeKeywords.map(k => `-${k}`).join('\n')} label="Copy All" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {campaign.campaignNegativeKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
                        -{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ad groups */}
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Ad Groups ({campaign.adGroups.length})
                  </h3>
                  {campaign.adGroups.map((group, i) => (
                    <AdGroupCard key={i} group={group} index={i} />
                  ))}
                </div>

                {/* Estimated metrics */}
                <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-display font-black text-white mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Estimated Campaign Performance
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(campaign.estimatedMetrics).map(([key, val]) => (
                      <div key={key} className="text-center bg-slate-900/50 rounded-xl p-3">
                        <div className="text-emerald-400 font-display font-black text-xl">{val}</div>
                        <div className="text-slate-400 text-[10px] font-mono uppercase mt-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadCSV}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-base uppercase tracking-wider rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <Download className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Download Google Ads CSV</span>
                    <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-6 py-4 bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold rounded-xl transition-all flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" /> Open Google Ads
                    </motion.button>
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── TAB: EMAIL TEMPLATE ── */}
            {activeTab === 'email' && emailTemplate && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
                      <Mail className="h-6 w-6 text-blue-400" />
                      Reactivation Email Template
                    </h3>
                    <CopyButton text={`Subject: ${emailTemplate.subject}\n\n${emailTemplate.body}`} label="Copy Full Email" />
                  </div>

                  {/* Subject line */}
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Line</div>
                    <div className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-xl p-4">
                      <span className="text-white font-bold flex-1">{emailTemplate.subject}</span>
                      <CopyButton text={emailTemplate.subject} label="Copy" />
                    </div>
                  </div>

                  {/* Email body */}
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Email Body</div>
                    <div className="bg-white rounded-2xl p-6 text-slate-800 font-sans text-sm leading-relaxed whitespace-pre-line shadow-xl">
                      {emailTemplate.body}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 space-y-2">
                    <div className="text-sm font-bold text-blue-300 flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Pro Tips for Higher Open Rates
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-300">
                      {[
                        'Send within 2 hours of weather trigger for maximum relevance',
                        'Replace [First Name] with actual customer names for 30% higher open rate',
                        'Send between 7–9 AM or 5–7 PM for best engagement',
                        'Add your logo and phone number above the CTA button',
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB: LSA CHECKLIST ── */}
            {activeTab === 'lsa' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
                        <List className="h-6 w-6 text-emerald-400" />
                        Local Services Ads (LSA) Setup Checklist
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">Complete all items to go live with Google Guaranteed badge</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-display font-black text-emerald-400">
                        {lsaChecklist.filter(i => i.completed).length}/{lsaChecklist.length}
                      </div>
                      <div className="text-slate-400 text-xs font-mono">completed</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${(lsaChecklist.filter(i => i.completed).length / lsaChecklist.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-3">
                    {lsaChecklist.map((item, i) => (
                      <motion.button key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        onClick={() => toggleLSA(i)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          item.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                        }`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          item.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {item.completed && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                        <span className={`font-medium ${item.completed ? 'text-emerald-200 line-through' : 'text-slate-200'}`}>
                          {item.item}
                        </span>
                        {item.completed && <span className="ml-auto text-xs text-emerald-400 font-mono font-bold">DONE</span>}
                      </motion.button>
                    ))}
                  </div>

                  {lsaChecklist.every(i => i.completed) && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-center">
                      <CheckCircle className="h-10 w-10 text-white mx-auto mb-2" />
                      <p className="text-white font-display font-black text-xl">LSA Profile Ready!</p>
                      <p className="text-emerald-100 text-sm mt-1">Your Google Guaranteed badge is within reach.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── TAB: REDDIT LEADS ── */}
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
                  <div className="text-center py-20 space-y-3">
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
                              <span>{post.score} upvotes</span>
                              <span>{post.num_comments} comments</span>
                            </div>
                          </div>
                          <a href={post.url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all">
                            <ExternalLink className="h-3.5 w-3.5 text-slate-500 hover:text-white" />
                          </a>
                        </div>
                        {post.urgency === 'HIGH' && (
                          <div className="mt-3 pt-3 border-t border-slate-800 flex items-start gap-2.5">
                            <Zap className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 font-mono leading-relaxed">
                              High-intent lead signal. Your Google Ads campaign is already targeting this search behavior.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
