/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Shield, HelpCircle, Zap, TrendingUp, Award } from 'lucide-react';

interface PricingProps {
  onSelectTier: (tierName: string) => void;
}

export default function Pricing({ onSelectTier }: PricingProps) {
  const tiers = [
    {
      name: 'Starter',
      price: '$99',
      billing: 'per month',
      tagline: 'Launch Fast',
      description: 'Ideal for independent local trade specialists or single-vehicle operators.',
      features: [
        'Weekly live scouting radar access',
        'Direct weather trigger signals (Meteo)',
        'Active meteorology warning indicators',
        'Algorithmic intent score index',
        'Standard negative keyword exclusions'
      ],
      cta: 'Subscribe to Starter',
      gradient: 'from-slate-700 to-slate-800',
      iconColor: 'text-slate-400'
    },
    {
      name: 'Growth',
      price: '$199',
      billing: 'per month',
      tagline: 'Scale Revenue',
      description: 'Perfect for local contractor teams seeking automated ad copy and scripts.',
      features: [
        'Everything in Starter, plus:',
        'Outbound opt-in email copywriting templates',
        'Google AdWords Campaign playbooks',
        'Checklist setup systems for LSA cards',
        'Asset copy text exporters',
        'Priority email support'
      ],
      hot: true,
      cta: 'Activate Growth Plan',
      gradient: 'from-blue-600 to-indigo-600',
      iconColor: 'text-blue-400'
    },
    {
      name: 'Pro',
      price: '$299',
      billing: 'per month',
      tagline: 'Dominate Markets',
      description: 'Designed for enterprise contractors with dispatch logs and multiple regions.',
      features: [
        'Everything in Growth, plus:',
        'Interactive KPIs & campaign tracking loggers',
        'Live local leads storage system',
        'Custom admin overrides panel',
        'Prioritized REST API proxy support',
        'Multi-region coverage',
        'White-label options'
      ],
      cta: 'Deploy Pro Intelligence',
      gradient: 'from-emerald-600 to-teal-600',
      iconColor: 'text-emerald-400'
    }
  ];

  return (
    <div id="pricing-matrix-workspace" className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Header Section - UPGRADED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/30 px-5 py-2.5 rounded-full backdrop-blur-md shadow-xl mb-6"
          >
            <Award className="h-5 w-5 text-blue-400 animate-pulse" />
            <span className="text-sm font-mono font-black tracking-widest text-blue-400 uppercase">
              Simple, Transparent Pricing
            </span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white mt-4 mb-6 leading-tight"
          >
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">
              Competitive Edge
            </span>
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto"
          >
            Stop burning budget on unvetted leads. Get <span className="text-blue-400 font-bold">weather-triggered intelligence</span> that puts you{' '}
            <span className="text-emerald-400 font-bold">18-72 hours ahead</span> of competitors.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-400"
          >
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              SSL encrypted
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-400" />
              Instant activation
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Grid - UPGRADED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: tier.hot ? 1.05 : 1 }}
              transition={{ delay: 0.2 * idx, duration: 0.6 }}
              whileHover={{ scale: tier.hot ? 1.08 : 1.03, y: -10 }}
              className={`group relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.hot
                  ? 'bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-blue-600/10 border-2 border-blue-500 shadow-2xl shadow-blue-500/30 z-10'
                  : 'bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-900/90 border border-slate-800 hover:border-slate-700'
              } backdrop-blur-xl overflow-hidden`}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              {/* Recommended badge */}
              {tier.hot && (
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-xs font-black uppercase tracking-wider rounded-full shadow-xl flex items-center gap-2"
                >
                  <Star className="h-4 w-4 fill-white text-white animate-pulse" />
                  Most Popular
                </motion.span>
              )}

              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-2xl font-display font-black tracking-tight ${tier.hot ? 'text-white' : 'text-slate-100'}`}>
                      {tier.name}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tier.hot ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                      {tier.tagline}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${tier.hot ? 'text-blue-100' : 'text-slate-400'}`}>
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-display font-black tracking-tight ${tier.hot ? 'text-white' : 'text-slate-100'}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm font-mono ${tier.hot ? 'text-blue-200' : 'text-slate-400'}`}>
                    / month
                  </span>
                </div>

                {/* Divider */}
                <div className={`h-px ${tier.hot ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-700 to-transparent'}`} />

                {/* Features */}
                <ul className="space-y-4 text-sm">
                  {tier.features.map((feature, fIdx) => (
                    <motion.li
                      key={fIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + fIdx * 0.1, duration: 0.4 }}
                      className="flex items-start space-x-3 group/item"
                    >
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        tier.hot ? 'bg-blue-500/20' : 'bg-slate-800'
                      }`}>
                        <Check className={`h-3 w-3 ${tier.hot ? 'text-blue-400' : 'text-slate-400'} group-hover/item:scale-110 transition-transform`} />
                      </div>
                      <span className={`${tier.hot ? 'text-slate-200' : 'text-slate-400'} leading-relaxed`}>
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 mt-8 pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id={`pricing-select-${tier.name.toLowerCase()}`}
                  onClick={() => onSelectTier(tier.name)}
                  className={`w-full py-4 font-display font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer relative overflow-hidden group/btn ${
                    tier.hot
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {tier.cta}
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center max-w-2xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl"
        >
          <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h4 className="text-xl font-display font-bold text-white mb-2">
            Enterprise-Grade Security
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            All transactions are processed securely over <span className="text-blue-400 font-bold">256-bit SSL encryption</span>. Your financial data is never stored on our servers. Cancel your subscription anytime with <span className="text-emerald-400 font-bold">zero penalties</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
