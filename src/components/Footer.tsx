/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Database, Twitter, Linkedin, Github, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onRouteChange: (route: string) => void;
}

export default function Footer({ onRouteChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="relative bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800 text-slate-400 text-sm py-16 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo Brand Statement - UPGRADED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 md:col-span-1"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                J
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">
                Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-black">Leak</span>
              </span>
            </div>
            
            <p className="text-slate-300 leading-relaxed text-sm">
              Weather-triggered contractor intelligence. Get <span className="text-blue-400 font-bold">18-72 hours ahead</span> of your competition with AI-powered lead forecasting.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
                { icon: Linkedin, href: '#', color: 'hover:text-blue-500' },
                { icon: Github, href: '#', color: 'hover:text-slate-300' },
                { icon: Mail, href: '#', color: 'hover:text-emerald-400' }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ scale: 1.2, y: -2 }}
                  href={social.href}
                  className={`w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 ${social.color} transition-all`}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick links - UPGRADED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <h4 className="text-white font-display font-bold text-base mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Platform
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              {[
                { label: 'Market Scanner', route: '#scan' },
                { label: 'Weather Radar', route: '#radar' },
                { label: 'Campaign Builder', route: '#campaign' },
                { label: 'Dashboard', route: '#dashboard' },
                { label: 'Pricing', route: '#pricing' }
              ].map((link, idx) => (
                <li key={idx}>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => { onRouteChange(link.route); window.location.hash = link.route; }}
                    className="text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors" />
                    {link.label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* API Status - UPGRADED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h4 className="text-white font-display font-bold text-base mb-5 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              Data Sources
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Open-Meteo API', status: 'operational', color: 'emerald' },
                { name: 'NWS Weather Alerts', status: 'operational', color: 'emerald' },
                { name: 'Google Places API', status: 'standby', color: 'amber' },
                { name: 'Permit Data Feeds', status: 'syncing', color: 'blue' }
              ].map((api, idx) => (
                <li key={idx} className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${api.color}-500`} />
                    {api.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase text-${api.color}-400`}>
                    {api.status}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* System Status - UPGRADED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4"
          >
            <h4 className="text-white font-display font-bold text-base mb-5 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              System Status
            </h4>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">API Health:</span>
                <span className="text-emerald-400 flex items-center gap-2 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">Uptime:</span>
                <span className="text-blue-400 font-bold">99.97%</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">Data Feeds:</span>
                <span className="text-slate-300 font-bold">142.8K active</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Bar - UPGRADED */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="pt-8 border-t border-slate-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <span>© {currentYear} JobLeak Intelligence Technologies.</span>
              <span className="hidden md:inline">•</span>
              <span>Built with</span>
              <Heart className="h-3 w-3 text-red-400 fill-red-400" />
              <span>for contractors.</span>
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
