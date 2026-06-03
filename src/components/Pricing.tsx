/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Star, Shield, HelpCircle } from 'lucide-react';

interface PricingProps {
  onSelectTier: (tierName: string) => void;
}

export default function Pricing({ onSelectTier }: PricingProps) {
  const tiers = [
    {
      name: 'Starter',
      price: '$99',
      billing: 'per month',
      description: 'Ideal for independent local trade specialists or single-vehicle operators.',
      features: [
        'Weekly live scouting radar access',
        'Direct weather trigger signals (Meteo)',
        'Active meteorology warning indicators',
        'Algorithmic intent score index',
        'Standard negative keyword exclusions'
      ],
      cta: 'Subscribe to Starter'
    },
    {
      name: 'Growth',
      price: '$199',
      billing: 'per month',
      description: 'Perfect for local contractor teams seeking automated ad copy and scripts.',
      features: [
        'Weekly live scouting radar access',
        'Direct weather trigger signals (Meteo)',
        'Active meteorology warning indicators',
        'Algorithmic intent score index',
        'Standard negative keyword exclusions',
        'Outbound opt-in email copywriting templates',
        'Google AdWords Campaign playbooks',
        'Checklist setup systems for LSA cards',
        'Asset copy text exporters'
      ],
      hot: true,
      cta: 'Activate Growth Plan'
    },
    {
      name: 'Pro',
      price: '$299',
      billing: 'per month',
      description: 'Designed for enterprise contractors with dispatch logs and multiple regions.',
      features: [
        'Weekly live scouting radar access',
        'Direct weather trigger signals (Meteo)',
        'Active meteorology warning indicators',
        'Algorithmic intent score index',
        'Standard negative keyword exclusions',
        'Outbound opt-in email copywriting templates',
        'Google AdWords Campaign playbooks',
        'Checklist setup systems for LSA cards',
        'Asset copy text exporters',
        'Interactive KPIs & campaign tracking loggers',
        'Live local leads storage system',
        'Custom admin overrides panel',
        'Prioritized Rest API proxy support'
      ],
      cta: 'Deploy Pro Intelligence'
    }
  ];

  return (
    <div id="pricing-matrix-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-sm font-mono font-bold tracking-widest text-blue-400 uppercase">
          Subscription Tiers
        </h2>
        <h3 className="text-3xl font-display font-medium text-white mt-2">
          Clear, Flat-rate Contractor Pricing
        </h3>
        <p className="text-slate-400 mt-3 text-sm leading-relaxed">
          Unlock extreme meteorological search intent tracking and stop pouring budget into unvetted, high-competition ad coordinates. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((t, idx) => (
          <div 
            key={idx} 
            className={`rounded-2xl border p-8 flex flex-col justify-between transition-all relative ${
              t.hot 
                ? 'bg-slate-900 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-[1.03] z-10 text-white' 
                : 'bg-slate-900/50 text-slate-200 border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
            }`}
          >
            {t.hot && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1">
                <Star className="h-3 w-3 fill-white text-white" />
                Recommended Tier
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h4 className={`text-lg font-display font-bold tracking-tight ${t.hot ? 'text-white' : 'text-slate-100'}`}>{t.name}</h4>
                <p className={`text-sm mt-1.5 leading-relaxed ${t.hot ? 'text-blue-100' : 'text-slate-400'}`}>
                  {t.description}
                </p>
              </div>

              <div className="flex items-baseline">
                <span className={`text-4xl font-display font-black tracking-tight ${t.hot ? 'text-white' : 'text-slate-100'}`}>{t.price}</span>
                <span className={`text-sm font-mono ml-2 ${t.hot ? 'text-blue-200' : 'text-slate-400'}`}>
                  / {t.billing}
                </span>
              </div>

              {/* Separation line */}
              <div className={`border-t ${t.hot ? 'border-blue-500/20' : 'border-slate-800'}`} />

              <ul className="space-y-3.5 text-sm font-sans">
                {t.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${t.hot ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className={t.hot ? 'text-slate-200' : 'text-slate-400'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6">
              <button
                id={`pricing-select-${t.name.toLowerCase()}`}
                onClick={() => onSelectTier(t.name)}
                className={`w-full py-3 font-display font-bold text-sm uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer ${
                  t.hot 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-2 focus:ring-blue-400 shadow-blue-900/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60'
                }`}
              >
                {t.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-slate-400 max-w-md mx-auto">
        <p className="flex items-center justify-center space-x-1.5">
          <Shield className="h-4 w-4 text-blue-500" />
          <span>All transactions process safely over SSL encryption keys.</span>
        </p>
      </div>

    </div>
  );
}
