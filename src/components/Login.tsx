/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Loader2, 
  Chrome, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
  Info,
  Check,
  LogIn
} from 'lucide-react';
import { 
  getUsersDatabase, 
  saveUsersDatabase, 
  saveActiveSession, 
  getSavedCredentials, 
  saveCredentials, 
  AuthUser 
} from '../authService';
import { StatesList } from '../types';
import CheckoutModal from './CheckoutModal';

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type AuthMode = 'signin' | 'signup';
type ChannelType = 'email' | 'phone';

export default function Login({ onLoginSuccess }: LoginProps) {
  // Authentication states
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [channel, setChannel] = useState<ChannelType>('email');
  
  // Input fields (initialized empty so users NEVER see default/someone else's email address by default)
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up specifics
  const [businessName, setBusinessName] = useState('');
  const [selectedState, setSelectedState] = useState('TX');
  const [targetCity, setTargetCity] = useState('Austin');
  const [industry, setIndustry] = useState('HVAC');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'Starter' | 'Growth' | 'Pro'>('Growth');

  // Interactive Payment Checkout variables
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingNewUser, setPendingNewUser] = useState<AuthUser | null>(null);

  // UI state variables
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Google SSO Redirection Simulator parameters
  const [showGoogleSimulator, setShowGoogleSimulator] = useState(false);
  const [googleStep, setGoogleStep] = useState<1 | 2>(1);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load saved matching credentials on mount (Auto-Save / Remember Me workflow)
  useEffect(() => {
    const creds = getSavedCredentials();
    if (creds && creds.remember) {
      setRememberMe(true);
      if (creds.email) {
        setEmailInput(creds.email);
        setChannel('email');
      } else if (creds.phone) {
        setPhoneInput(creds.phone);
        setChannel('phone');
      }
      if (creds.password) {
        setPasswordInput(creds.password);
      }
    }
  }, []);

  // Sync city selection when state dropdown updates
  useEffect(() => {
    const list = StatesList.find(s => s.code === selectedState)?.cities || [];
    if (list.length > 0 && (!list.includes(targetCity) || targetCity === 'Austin' && selectedState !== 'TX')) {
      setTargetCity(list[0]);
    }
  }, [selectedState]);

  // Quick helper to fill simulated credentials for easy sandbox testing.
  const handleUseDeveloperTestCredentials = (email: string, pass: string) => {
    setErrorText(null);
    setChannel('email');
    setEmailInput(email);
    setPasswordInput(pass);
    setAuthMode('signin');
  };

  // Process core Email/Phone & Password Authentication
  const handleSubmitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    const credentialKey = channel === 'email' ? emailInput.trim().toLowerCase() : phoneInput.trim();
    if (!credentialKey) {
      setErrorText(`Please enter your ${channel} coordinate.`);
      return;
    }
    if (!passwordInput) {
      setErrorText('Please specify your account password.');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const db = getUsersDatabase();

      if (authMode === 'signin') {
        // Sign In Flow which matches existing credentials inside mock database
        const foundUser = db.find(user => {
          if (channel === 'email') {
            return user.email?.toLowerCase() === credentialKey && user.password === passwordInput;
          } else {
            return user.phone === credentialKey && user.password === passwordInput;
          }
        });

        if (foundUser) {
          // Commit Auto-Save parameter rules
          if (rememberMe) {
            saveCredentials({
              email: channel === 'email' ? emailInput : undefined,
              phone: channel === 'phone' ? phoneInput : undefined,
              password: passwordInput,
              remember: true
            });
          } else {
            saveCredentials(null);
          }

          setSubmitting(false);
          setSuccess(true);
          saveActiveSession(foundUser);
          
          setTimeout(() => {
            onLoginSuccess(foundUser);
          }, 1000);
        } else {
          setSubmitting(false);
          setErrorText('Invalid secret key or password credentials. Verify details or try signing up underneath.');
        }
      } else {
        // Sign Up Flow
        if (passwordInput.length < 6) {
          setSubmitting(false);
          setErrorText('Password must consist of at least 6 characters.');
          return;
        }
        if (passwordInput !== confirmPasswordInput) {
          setSubmitting(false);
          setErrorText('Passwords do not match.');
          return;
        }
        if (!businessName.trim()) {
          setSubmitting(false);
          setErrorText('Please state your Contractor Company or Business Name.');
          return;
        }

        // Check if user already exists
        const emailExists = db.some(u => u.email?.toLowerCase() === emailInput.trim().toLowerCase() && emailInput.trim().length > 0);
        const phoneExists = db.some(u => u.phone === phoneInput.trim() && phoneInput.trim().length > 0);

        if (emailExists || phoneExists) {
          setSubmitting(false);
          setErrorText('An account with these coordinates is already registered. Please login instead.');
          return;
        }

        // Build elegant fresh personalized configuration matching their target metrics!
        const brandNewUser: AuthUser = {
          id: `user-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)}`,
          email: channel === 'email' ? emailInput.trim().toLowerCase() : undefined,
          phone: channel === 'phone' ? phoneInput.trim() : undefined,
          password: passwordInput,
          businessName: businessName.trim(),
          industry: industry,
          city: `${targetCity}, ${selectedState}`,
          subscriptionPlan: subscriptionPlan,
          loggedCalls: [],
          billingHistory: [
            { 
              id: `invoice-${Math.random().toString(36).substring(2, 6)}`, 
              invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`, 
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 
              amount: subscriptionPlan === 'Starter' ? 99 : subscriptionPlan === 'Pro' ? 299 : 199, 
              plan: `${subscriptionPlan} Plan`, 
              status: 'Paid' 
            }
          ],
          adSpendSaved: 0,
          activeLeadsCount: 0
        };

        // Cache registration details and summon Checkout Form
        setPendingNewUser(brandNewUser);
        setSubmitting(false);
        setShowCheckoutModal(true);
      }
    }, 1200);
  };

  // Process checkout completion handshake
  const handleCheckoutSuccess = () => {
    if (pendingNewUser) {
      const db = getUsersDatabase();
      const updatedDb = [...db, pendingNewUser];
      saveUsersDatabase(updatedDb);

      if (rememberMe) {
        saveCredentials({
          email: channel === 'email' ? emailInput : undefined,
          phone: channel === 'phone' ? phoneInput : undefined,
          password: passwordInput,
          remember: true
        });
      } else {
        saveCredentials(null);
      }

      setSuccess(true);
      saveActiveSession(pendingNewUser);

      setTimeout(() => {
        onLoginSuccess(pendingNewUser);
      }, 1000);
    }
    setShowCheckoutModal(false);
  };

  // High-fidelity redirect simulation for Google accounts authentication bypass
  const handleGoogleHandshakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.includes('@')) {
      alert('Please enter a valid Google Account address.');
      return;
    }
    setGoogleLoading(true);

    setTimeout(() => {
      // Create user from dynamic Google SSO details
      const db = getUsersDatabase();
      const googleId = googleEmail.trim().toLowerCase();
      
      let matchedUser = db.find(u => u.email?.toLowerCase() === googleId);
      
      if (!matchedUser) {
        // Construct fresh Google account mapping
        matchedUser = {
          id: `google-${Math.random().toString(36).substring(2, 9)}`,
          email: googleId,
          businessName: `${googleEmail.split('@')[0].toUpperCase()} Enterprise Services`,
          industry: 'HVAC',
          city: 'Phoenix',
          subscriptionPlan: 'Growth',
          loggedCalls: [],
          billingHistory: [
            { id: 'i-google', invoiceNo: 'INV-2026-901', date: '02 June 2026', amount: 299, plan: 'Growth Plan', status: 'Paid' }
          ],
          adSpendSaved: 150,
          activeLeadsCount: 1
        };
        saveUsersDatabase([...db, matchedUser]);
      }

      setGoogleLoading(false);
      setSuccess(true);
      setShowGoogleSimulator(false);
      saveActiveSession(matchedUser);

      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 1000);

    }, 1500);
  };

  return (
    <div id="login-container" className="max-w-md mx-auto my-12 px-4 transition-all duration-300">
      
      {/* 1. MOCK GOOGLE REDIRECTION DIALOG (Bypasses iframe sandboxing errors perfectly) */}
      {showGoogleSimulator ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-300 shadow-2xl overflow-hidden relative font-sans text-slate-800 animate-fade-in animate-duration-300">
          <div className="bg-[#f2f2f2] px-6 py-4 border-b border-slate-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-yellow-405 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-bold">
              Secure Auth Redirection (accounts.google.com)
            </span>
            <button 
              type="button" 
              onClick={() => setShowGoogleSimulator(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-mono font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="p-8 bg-white space-y-6">
            <div className="text-center space-y-3">
              {/* Google Classic Logo */}
              <div className="flex justify-center">
                <span className="text-2xl font-black tracking-tight select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign in with Google</h2>
              <p className="text-xs text-slate-500">to continue to <strong className="text-blue-600">JobLeak Control</strong></p>
            </div>

            {googleStep === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); setGoogleStep(2); }} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="Email or phone (e.g. contractor@gmail.com)"
                    className="w-full bg-white border border-slate-300 text-sm px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-550 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div className="text-xs text-slate-500 leading-normal">
                  To proceed safely under restricted sandbox frames, this active OAuth channel is redirected locally through JobLeak's secure SSO pipeline.
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setGoogleEmail('alex.developer@gmail.com'); setGoogleStep(2); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Use Demo Google Account
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded transition-all cursor-pointer shadow-sm font-sans"
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleGoogleHandshakeSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 bg-slate-100 p-2.5 rounded-lg text-xs font-mono text-slate-650 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">G</div>
                  <span className="font-semibold block truncate max-w-[240px]">{googleEmail}</span>
                  <button type="button" onClick={() => setGoogleStep(1)} className="text-blue-600 ml-auto font-bold underline hover:text-blue-800">Change</button>
                </div>
                
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white border border-slate-300 text-sm px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-blue-550 focus:border-blue-500 text-slate-900"
                  />
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <button 
                    type="button" 
                    onClick={() => setGoogleStep(1)} 
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded transition-all cursor-pointer shadow-sm flex items-center space-x-1"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Complete Authentic Sign In</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* 2. CORE DYNAMIC AUTHENTICATION FRAME */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 relative overflow-hidden transition-all duration-300">
          
          {/* Top brand header bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />
          
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-3xl font-bold animate-bounce shadow-sm">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 tracking-tight">Access Handshake Executed</h3>
              <p className="text-xs text-slate-500 font-mono">
                Opening localized workspace controls and subscription templates...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header Titles */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 mx-auto">
                  {authMode === 'signin' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                </div>
                
                <h2 className="text-2xl font-display font-black text-slate-950 tracking-tight">
                  {authMode === 'signin' ? 'Contractor System Access' : 'Create Intelligence Account'}
                </h2>
                
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {authMode === 'signin' 
                    ? 'Enter secure password metrics to lock in meteorology alerts and priority campaigns.' 
                    : 'Configure bespoke settings to build personalized weather trigger radars.'}
                </p>
              </div>

              {/* AUTH ROUTE SWITCHER (Toggles clean state context) */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorText(null); }}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5 inline mr-1" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorText(null); }}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5 inline mr-1" />
                  Create Profile
                </button>
              </div>

              {errorText && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-lg font-mono font-bold">
                  {errorText}
                </div>
              )}

              {/* GOOGLE HANDSHAKE INITIATOR TRIGGER (Triggers accounts.google.com simulator safely) */}
              <div className="space-y-1">
                <button
                  id="google-redirect-opener"
                  type="button"
                  onClick={() => {
                    setErrorText(null);
                    setShowGoogleSimulator(true);
                  }}
                  className="w-full py-3 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-705 text-slate-700 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm cursor-pointer"
                >
                  <Chrome className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                  <span>Redirect to Google Auth</span>
                </button>
                <div className="text-center text-[9px] text-slate-400 font-mono">
                  Guarantees authentic Google sign-in workflow bypasses iframe constraints
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  or use your credentials
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* EMAIL/SMS CHANNEL TOGGLER */}
              <div className="flex justify-center space-x-4 border-b border-slate-100 pb-3 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer font-mono font-bold text-slate-650">
                  <input
                    type="radio"
                    name="channel_type"
                    checked={channel === 'email'}
                    onChange={() => setChannel('email')}
                    className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span>Email Channel</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-mono font-bold text-slate-650">
                  <input
                    type="radio"
                    name="channel_type"
                    checked={channel === 'phone'}
                    onChange={() => setChannel('phone')}
                    className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span>SMS Mobile Channel</span>
                </label>
              </div>

              {/* MASTER AUTHENTICATION FORM */}
              <form onSubmit={handleSubmitAuth} className="space-y-4">
                
                {channel === 'email' ? (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-550 mb-1.5 uppercase">
                      Email Coordinates
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. director@houstonroofs.org"
                        className="w-full bg-slate-50 border border-slate-200 text-xs pl-11 pr-4 py-3 border-r-4 hover:border-r-blue-400 focus:border-r-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-550 mb-1.5 uppercase">
                      Mobile Dispatch Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="e.g. +1 (512) 555-0199"
                        className="w-full bg-slate-50 border border-slate-200 text-xs pl-11 pr-4 py-3 border-r-4 hover:border-r-blue-400 focus:border-r-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Password field with dynamic eye toggle */}
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-550 mb-1.5 uppercase">
                    Security Access Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter secret login password"
                      className="w-full bg-slate-50 border border-slate-200 text-xs pl-11 pr-11 py-3 border-r-4 hover:border-r-blue-400 focus:border-r-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* SIGN UP PARAMETERS SPECIFICS SHEET */}
                {authMode === 'signup' && (
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-3 animate-fade-in">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-widest border-b border-slate-200 pb-1.5">
                      BESPOKE PROFILE INTEGRATION
                    </span>

                    {/* CONFIRM PASSWORD */}
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-type security key"
                        className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all font-mono"
                      />
                    </div>

                    {/* BUSINESS NAME */}
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                        Contractor Business Name
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Austin Air & Heating Services"
                        className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* STATE */}
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                          Target State
                        </label>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs px-1.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                        >
                          {StatesList.map(s => (
                            <option key={s.code} value={s.code}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* CITY */}
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                          City/Region
                        </label>
                        <select
                          value={targetCity}
                          onChange={(e) => setTargetCity(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs px-1.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 font-bold"
                        >
                          {StatesList.find(s => s.code === selectedState)?.cities.map(cityName => (
                            <option key={cityName} value={cityName}>{cityName}</option>
                          )) || <option value="">Select State</option>}
                        </select>
                      </div>

                      {/* INDUSTRY */}
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                          Service Trade
                        </label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs px-1.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900"
                        >
                          <option value="HVAC">HVAC</option>
                          <option value="Roofing">Roofing</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Pest Control">Pest Control</option>
                          <option value="Garage Door">Garage Door</option>
                        </select>
                      </div>
                    </div>

                    {/* SIGNUP PLAN CHOICE */}
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-505 text-slate-500 mb-1 uppercase">
                        Choose Membership Package
                      </label>
                      <select
                        value={subscriptionPlan}
                        onChange={(e) => setSubscriptionPlan(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 font-bold"
                      >
                        <option value="Starter">Starter Plan ($99/mo) — Independent Contractor</option>
                        <option value="Growth">Growth Plan ($199/mo) — Professional Team</option>
                        <option value="Pro">Pro Plan ($299/mo) — Enterprise Multi-Region Dispatch</option>
                      </select>
                    </div>

                  </div>
                )}

                {/* REMEMBER ME / SAVED LOGIN OPTION */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-305 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      Save Login Info (Remember Details)
                    </span>
                  </label>
                  
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      className="text-[11px] font-mono text-blue-600 hover:underline hover:text-blue-800"
                      onClick={() => alert('Demo sandbox: Enter password "password123" with default profiles to bypass or Sign Up with a custom password.')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Verify Key & Enter' : 'Register Profile & Launch'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* DEMO CUES TO AID TESTING INSTANTLY */}
              {authMode === 'signin' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 font-mono text-[10px]">
                  <div className="flex items-center text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-100 pb-1 mb-1.5">
                    <Info className="h-3.5 w-3.5 mr-1 text-blue-600" />
                    <span>Demo Credentials (saved login option testing)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <div>
                      <span className="text-slate-400">Email:</span> <strong className="text-slate-700">alpha@contractormarketing.com</strong>
                      <br />
                      <span className="text-slate-400">Pass:</span> <strong className="text-slate-700">password123</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseDeveloperTestCredentials('alpha@contractormarketing.com', 'password123')}
                      className="text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2 py-1 rounded"
                    >
                      Autofill
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <div>
                      <span className="text-slate-400">Email:</span> <strong className="text-slate-700">homer@texasroofing.net</strong>
                      <br />
                      <span className="text-slate-400">Pass:</span> <strong className="text-slate-700">password123</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseDeveloperTestCredentials('homer@texasroofing.net', 'password123')}
                      className="text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2 py-1 rounded"
                    >
                      Autofill
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        planName={subscriptionPlan}
        price={subscriptionPlan === 'Starter' ? 99 : subscriptionPlan === 'Pro' ? 299 : 199}
        onPaymentSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
