/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LOGIN — Split-screen enterprise auth. Million-dollar design.
 * Left: Brand panel with stats + testimonial
 * Right: Full auth flow (Google SSO, Email, Phone/OTP)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  Loader2,
  Phone,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Star,
  Shield,
  Database,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Zap,
} from 'lucide-react';
import { StatesList } from '../types';
import CheckoutModal from './CheckoutModal';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthUser, saveActiveSession } from '../authService';

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type AuthMode = 'signin' | 'signup';
type ChannelType = 'email' | 'phone';

// ── Google SVG icon (4-path official) ────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

// ── Left panel stats ──────────────────────────────────────────────────────────
const PANEL_STATS = [
  { icon: Database,   value: '142K+',  label: 'Weather-triggered feeds' },
  { icon: Clock,      value: '18–72h', label: 'Lead advantage window' },
  { icon: TrendingUp, value: '98.4%',  label: 'Forecast accuracy' },
  { icon: DollarSign, value: '$3.4K',  label: 'Average saved per month' },
];

const TESTIMONIAL = {
  quote: 'JobLeak flagged a freeze event 48 hours before my competitors noticed. That week alone was worth 6 months of the subscription.',
  author: 'Marcus T.',
  role: 'Owner, Apex HVAC — Austin, TX',
  stars: 5,
};

export default function Login({ onLoginSuccess }: LoginProps) {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authMode, setAuthMode]   = useState<AuthMode>('signin');
  const [channel, setChannel]     = useState<ChannelType>('email');

  // ── Input fields ────────────────────────────────────────────────────────────
  const [emailInput,           setEmailInput]           = useState('');
  const [phoneInput,           setPhoneInput]           = useState('');
  const [passwordInput,        setPasswordInput]        = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword,         setShowPassword]         = useState(false);
  const [otpCode,              setOtpCode]              = useState('');
  const [otpRequested,         setOtpRequested]         = useState(false);
  const [confirmationResult,   setConfirmationResult]   = useState<ConfirmationResult | null>(null);

  // ── Sign-up profile ─────────────────────────────────────────────────────────
  const [businessName,      setBusinessName]      = useState('');
  const [selectedState,     setSelectedState]     = useState('TX');
  const [targetCity,        setTargetCity]        = useState('Austin');
  const [industry,          setIndustry]          = useState('HVAC');
  const [subscriptionPlan,  setSubscriptionPlan]  = useState<'Starter' | 'Growth' | 'Pro'>('Growth');

  // ── Checkout ────────────────────────────────────────────────────────────────
  const [showCheckoutModal,  setShowCheckoutModal]  = useState(false);
  const [pendingFirebaseUid, setPendingFirebaseUid] = useState<string | null>(null);
  const [pendingUserEmail,   setPendingUserEmail]   = useState<string | null>(null);
  const [pendingUserPhone,   setPendingUserPhone]   = useState<string | null>(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [submitting,    setSubmitting]    = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorText,     setErrorText]     = useState<string | null>(null);
  const [success,       setSuccess]       = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // ── City sync ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const list = StatesList.find(s => s.code === selectedState)?.cities || [];
    if (list.length > 0 && !list.includes(targetCity)) {
      setTargetCity(list[0]);
    }
  }, [selectedState]);

  // ── Recaptcha (invisible) ───────────────────────────────────────────────────
  useEffect(() => {
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } catch (e) {
      console.error('Recaptcha setup error:', e);
    }
  }, []);

  // ── Success progress bar ────────────────────────────────────────────────────
  useEffect(() => {
    if (!success) return;
    const t1 = setTimeout(() => setProgressWidth(60),  100);
    const t2 = setTimeout(() => setProgressWidth(100), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [success]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const createFirestoreProfile = async (uid: string, email?: string | null, phone?: string | null): Promise<AuthUser> => {
    const newProfile: AuthUser = {
      id: uid,
      email:   email   || undefined,
      phone:   phone   || undefined,
      businessName:     businessName.trim() || 'New Services',
      industry:         industry || 'HVAC',
      city:             `${targetCity}, ${selectedState}`,
      subscriptionPlan: subscriptionPlan,
      loggedCalls:      [],
      billingHistory: [
        {
          id:        `invoice-${Math.random().toString(36).substring(2, 6)}`,
          invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
          date:      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount:    subscriptionPlan === 'Starter' ? 99 : subscriptionPlan === 'Pro' ? 299 : 199,
          plan:      `${subscriptionPlan} Plan`,
          status:    'Paid',
        },
      ],
      adSpendSaved:     0,
      activeLeadsCount: 0,
    };
    try {
      await setDoc(doc(db, 'users', uid), newProfile);
      return newProfile;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${uid}`);
      throw e;
    }
  };

  const syncExistingProfile = async (uid: string, email?: string | null, phone?: string | null): Promise<AuthUser> => {
    try {
      const docRef  = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return docSnap.data() as AuthUser;
      return await createFirestoreProfile(uid, email, phone);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${uid}`);
      throw e;
    }
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setErrorText(null);
    setGoogleLoading(true);
    try {
      const result      = await signInWithPopup(auth, googleProvider);
      const userProfile = await syncExistingProfile(result.user.uid, result.user.email);
      saveActiveSession(userProfile);
      setSuccess(true);
      setTimeout(() => onLoginSuccess(userProfile), 1600);
    } catch (error: any) {
      setErrorText(error.message || 'Google Auth failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── SMS OTP ─────────────────────────────────────────────────────────────────
  const requestOtp = async () => {
    setErrorText(null);
    if (!phoneInput) { setErrorText('Enter your phone number first.'); return; }
    setSubmitting(true);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result      = await signInWithPhoneNumber(auth, phoneInput, appVerifier);
      setConfirmationResult(result);
      setOtpRequested(true);
      setErrorText(`Verification code sent to ${phoneInput}.`);
    } catch (e: any) {
      setErrorText('SMS error — ensure Phone Auth is enabled in Firebase Console. ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Checkout callback ────────────────────────────────────────────────────────
  const handleCheckoutSuccess = async () => {
    try {
      if (pendingFirebaseUid) {
        const freshProfile = await createFirestoreProfile(pendingFirebaseUid, pendingUserEmail, pendingUserPhone);
        saveActiveSession(freshProfile);
        setSuccess(true);
        setTimeout(() => onLoginSuccess(freshProfile), 1600);
      }
    } catch (e: any) {
      setErrorText('Checkout success, but profile creation failed: ' + e.message);
    }
    setShowCheckoutModal(false);
  };

  // ── Main submit ──────────────────────────────────────────────────────────────
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    // OTP confirm
    if (channel === 'phone' && otpRequested && confirmationResult) {
      if (!otpCode) { setErrorText('Enter the 6-digit verification code.'); return; }
      setSubmitting(true);
      try {
        const result = await confirmationResult.confirm(otpCode);
        if (authMode === 'signup') {
          setPendingFirebaseUid(result.user.uid);
          setPendingUserPhone(result.user.phoneNumber);
          setShowCheckoutModal(true);
        } else {
          const profile = await syncExistingProfile(result.user.uid, null, result.user.phoneNumber);
          saveActiveSession(profile);
          setSuccess(true);
          setTimeout(() => onLoginSuccess(profile), 1600);
        }
      } catch (err: any) {
        setErrorText(err.message || 'Invalid verification code.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Request OTP
    if (channel === 'phone') { requestOtp(); return; }

    // Email validation
    if (!emailInput || !passwordInput) {
      setErrorText('Email and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (authMode === 'signup') {
        if (passwordInput !== confirmPasswordInput) throw new Error('Passwords do not match.');
        if (!businessName.trim()) throw new Error('Business name is required.');
        const cred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        setPendingFirebaseUid(cred.user.uid);
        setPendingUserEmail(cred.user.email);
        setShowCheckoutModal(true);
      } else {
        const cred    = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const profile = await syncExistingProfile(cred.user.uid, cred.user.email);
        saveActiveSession(profile);
        setSuccess(true);
        setTimeout(() => onLoginSuccess(profile), 1600);
      }
    } catch (err: any) {
      setErrorText(err.message || 'Authentication error. Ensure Email Auth is enabled in Firebase Console.');
    } finally {
      setSubmitting(false);
    }
  };

  const planPrices: Record<string, number> = { Starter: 99, Growth: 199, Pro: 299 };

  // ── Success full-screen ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center">
        <div id="recaptcha-container" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-8 px-6 max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center"
          >
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </motion.div>

          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-black text-white tracking-tight"
            >
              Access Granted
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-slate-500 font-mono text-sm"
            >
              Loading your intelligence workspace...
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="space-y-2"
          >
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-right">
              {progressWidth < 100 ? 'Syncing profile...' : 'Routing to dashboard'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div id="recaptcha-container" />

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col bg-slate-900 border-r border-slate-800 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-display font-black text-lg tracking-tight">JobLeak</span>
              <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest -mt-0.5">Intelligence Platform</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-4xl xl:text-5xl font-display font-black text-white leading-none tracking-tight mb-4">
              Strike First.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Win Every Time.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Real-time weather intelligence that puts your ads in front of homeowners the moment demand spikes — before anyone else can react.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {PANEL_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4"
              >
                <stat.icon className="h-4 w-4 text-blue-400 mb-2.5" />
                <div className="text-xl font-display font-black text-white">{stat.value}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-auto">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: TESTIMONIAL.stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                "{TESTIMONIAL.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                  {TESTIMONIAL.author[0]}
                </div>
                <div>
                  <div className="text-white text-xs font-bold">{TESTIMONIAL.author}</div>
                  <div className="text-slate-500 text-[10px] font-mono">{TESTIMONIAL.role}</div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-[10px] font-mono text-slate-700 mt-6">
              © 2026 JobLeak Inc. · All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-10 px-4 sm:px-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-display font-black text-lg tracking-tight">JobLeak</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-black text-white tracking-tight">
              {authMode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-mono">
              {authMode === 'signin'
                ? 'Sign in to your intelligence dashboard'
                : 'Set up your contractor profile in 60 seconds'}
            </p>
          </div>

          {/* Mode toggle (pill — OK per spec for segmented control) */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as AuthMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => { setAuthMode(mode); setErrorText(null); setOtpRequested(false); }}
                className={`flex-1 py-2.5 text-sm font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === mode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode === 'signin' ? 'Sign In' : 'Sign Up Free'}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {errorText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl font-mono leading-relaxed"
              >
                {errorText}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google SSO */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-3 mb-5 cursor-pointer disabled:opacity-50 group relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            {googleLoading
              ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              : <GoogleIcon />
            }
            <span>Continue with Google</span>
          </button>

          {/* OR divider */}
          <div className="relative flex items-center mb-5">
            <div className="flex-grow border-t border-slate-800" />
            <span className="mx-3 text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest shrink-0">or</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Channel toggle — underline tabs per spec */}
          <div className="flex border-b border-slate-800 mb-5">
            {(['email', 'phone'] as ChannelType[]).map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => { setChannel(ch); setOtpRequested(false); setErrorText(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 -mb-px cursor-pointer ${
                  channel === ch
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {ch === 'email' ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                {ch === 'email' ? 'Email' : 'Phone / SMS'}
              </button>
            ))}
          </div>

          {/* Auth form */}
          <form onSubmit={handleSubmitAuth} className="space-y-4">

            {/* ── EMAIL FIELDS ── */}
            {channel === 'email' && (
              <>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm pl-11 pr-4 py-3 rounded-xl outline-none transition-all font-mono placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm pl-11 pr-11 py-3 rounded-xl outline-none transition-all font-mono placeholder:text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-3.5 text-slate-600 hover:text-slate-300 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── PHONE FIELDS ── */}
            {channel === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                    <input
                      type="tel"
                      required
                      disabled={otpRequested}
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="+1 512 555 0199"
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm pl-11 pr-4 py-3 rounded-xl outline-none transition-all font-mono placeholder:text-slate-700 disabled:opacity-50"
                    />
                  </div>
                </div>
                {otpRequested && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all font-mono tracking-[0.4em] text-center placeholder:text-slate-700 placeholder:tracking-normal"
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* ── SIGN-UP PROFILE SECTION ── */}
            <AnimatePresence>
              {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 pt-2"
                >
                  <div className="border-t border-slate-800 pt-4">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Business Profile
                    </p>

                    {/* Confirm password (email only) */}
                    {channel === 'email' && (
                      <div className="mb-4">
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                          <input
                            type="password"
                            required
                            value={confirmPasswordInput}
                            onChange={e => setConfirmPasswordInput(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm pl-11 pr-4 py-3 rounded-xl outline-none transition-all font-mono placeholder:text-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {/* Business name */}
                    <div className="mb-4">
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="e.g. Austin Air Systems"
                        className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-600 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-700"
                      />
                    </div>

                    {/* State / City / Trade */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">State</label>
                        <select
                          value={selectedState}
                          onChange={e => setSelectedState(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2 py-2.5 rounded-lg outline-none focus:border-blue-600 transition-all"
                        >
                          {StatesList.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">City</label>
                        <select
                          value={targetCity}
                          onChange={e => setTargetCity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2 py-2.5 rounded-lg outline-none focus:border-blue-600 transition-all"
                        >
                          {(StatesList.find(s => s.code === selectedState)?.cities || []).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">Trade</label>
                        <select
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2 py-2.5 rounded-lg outline-none focus:border-blue-600 transition-all"
                        >
                          {['HVAC','Roofing','Plumbing','Electrical'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Plan selector */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Select Plan
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Starter', 'Growth', 'Pro'] as const).map(plan => (
                          <button
                            key={plan}
                            type="button"
                            onClick={() => setSubscriptionPlan(plan)}
                            className={`relative py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                              subscriptionPlan === plan
                                ? 'bg-gradient-to-b from-blue-600 to-indigo-700 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <div className="text-[10px] font-black uppercase tracking-wider">{plan}</div>
                            <div className={`text-[9px] mt-0.5 ${subscriptionPlan === plan ? 'text-blue-200' : 'text-slate-600'}`}>
                              ${planPrices[plan]}/mo
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                  <span className="relative z-10">Processing...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">
                    {channel === 'phone' && !otpRequested
                      ? 'Send Verification Code'
                      : authMode === 'signin'
                        ? 'Sign In'
                        : 'Create Account'}
                  </span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-slate-600 font-mono mt-5">
            {authMode === 'signin' ? (
              <>
                No account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorText(null); }}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-bold"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorText(null); }}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-bold"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-5 mt-6 pt-6 border-t border-slate-900">
            {[
              { icon: Shield,   label: 'SSL Encrypted' },
              { icon: Zap,      label: 'Firebase Auth' },
              { icon: Database, label: 'Data stays yours' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700">
                <Icon className="h-3 w-3 text-slate-600" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        planName={subscriptionPlan}
        price={planPrices[subscriptionPlan]}
        onPaymentSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
