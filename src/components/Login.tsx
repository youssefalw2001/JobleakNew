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
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import { StatesList } from '../types';
import CheckoutModal from './CheckoutModal';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthUser, saveActiveSession } from '../authService';

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type AuthMode = 'signin' | 'signup';
type ChannelType = 'email' | 'phone';

export default function Login({ onLoginSuccess }: LoginProps) {
  // Authentication states
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [channel, setChannel] = useState<ChannelType>('email');
  
  // Input fields
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Sign up specifics
  const [businessName, setBusinessName] = useState('');
  const [selectedState, setSelectedState] = useState('TX');
  const [targetCity, setTargetCity] = useState('Austin');
  const [industry, setIndustry] = useState('HVAC');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'Starter' | 'Growth' | 'Pro'>('Growth');

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingFirebaseUid, setPendingFirebaseUid] = useState<string | null>(null);
  const [pendingUserEmail, setPendingUserEmail] = useState<string | null>(null);
  const [pendingUserPhone, setPendingUserPhone] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const list = StatesList.find(s => s.code === selectedState)?.cities || [];
    if (list.length > 0 && (!list.includes(targetCity) || targetCity === 'Austin' && selectedState !== 'TX')) {
      setTargetCity(list[0]);
    }
  }, [selectedState]);

  useEffect(() => {
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }
    } catch(e) {
      console.error("Recaptcha setup error:", e);
    }
  }, []);

  const createFirestoreProfile = async (uid: string, email?: string | null, phone?: string | null) => {
    const newProfile: AuthUser = {
      id: uid,
      email: email || undefined,
      phone: phone || undefined,
      businessName: businessName.trim() || 'New Services',
      industry: industry || 'HVAC',
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

    try {
      await setDoc(doc(db, 'users', uid), newProfile);
      return newProfile;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${uid}`);
      throw e;
    }
  };

  const syncExistingProfile = async (uid: string, email?: string | null, phone?: string | null) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AuthUser;
      }
      // If signed up via provider but missing profile
      return await createFirestoreProfile(uid, email, phone);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${uid}`);
      throw e;
    }
  };

  const handleGoogleLogin = async () => {
    setErrorText(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userProfile = await syncExistingProfile(result.user.uid, result.user.email);
      setSuccess(true);
      saveActiveSession(userProfile);
      setTimeout(() => onLoginSuccess(userProfile), 1000);
    } catch (error: any) {
      setErrorText(error.message || 'Google Auth Failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const requestOtp = async () => {
    setErrorText(null);
    if (!phoneInput) {
      setErrorText('Please enter your phone number.');
      return;
    }
    setSubmitting(true);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneInput, appVerifier);
      setConfirmationResult(result);
      setOtpRequested(true);
      setErrorText(`OTP sent to ${phoneInput}. Enter 6-digit code or complete reCAPTCHA.`);
    } catch(e: any) {
      setErrorText("Ensure phone provider is enabled in Firebase Console: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutSuccess = async () => {
    try {
      if (pendingFirebaseUid) {
        const freshProfile = await createFirestoreProfile(pendingFirebaseUid, pendingUserEmail, pendingUserPhone);
        setSuccess(true);
        saveActiveSession(freshProfile);
        setTimeout(() => onLoginSuccess(freshProfile), 1000);
      }
    } catch (e: any) {
      setErrorText('Checkout success, but profile creation failed: ' + e.message);
    }
    setShowCheckoutModal(false);
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    // Otp Verification mode
    if (channel === 'phone' && otpRequested && confirmationResult) {
       if (!otpCode) {
         setErrorText('Enter your verification code');
         return;
       }
       setSubmitting(true);
       try {
         const result = await confirmationResult.confirm(otpCode);
         if (authMode === 'signup') {
           setPendingFirebaseUid(result.user.uid);
           setPendingUserPhone(result.user.phoneNumber);
           setShowCheckoutModal(true);
         } else {
           const profile = await syncExistingProfile(result.user.uid, null, result.user.phoneNumber);
           setSuccess(true);
           saveActiveSession(profile);
           setTimeout(() => onLoginSuccess(profile), 1000);
         }
       } catch (err: any) {
         setErrorText(err.message || 'Invalid SMS code');
       } finally {
         setSubmitting(false);
       }
       return;
    }

    // Standard Submit
    if (channel === 'phone') {
       requestOtp();
       return;
    }

    if (!emailInput || !passwordInput) {
      setErrorText('Please specify your coordinates and password.');
      return;
    }

    setSubmitting(true);

    try {
      if (authMode === 'signup') {
        if (passwordInput !== confirmPasswordInput) {
          throw new Error('Passwords do not match.');
        }
        if (!businessName.trim()) {
          throw new Error('Please state your Contractor Company Name.');
        }
        const cred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        setPendingFirebaseUid(cred.user.uid);
        setPendingUserEmail(cred.user.email);
        setShowCheckoutModal(true);
      } else {
        const cred = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const profile = await syncExistingProfile(cred.user.uid, cred.user.email);
        setSuccess(true);
        saveActiveSession(profile);
        setTimeout(() => onLoginSuccess(profile), 1000);
      }
    } catch(err: any) {
      setErrorText(err.message || 'Authentication error. Note: Email Auth must be enabled in Firebase console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="login-container" className="max-w-md mx-auto my-12 px-4 transition-all duration-300">
      <div id="recaptcha-container"></div>
      
      <div className="bg-slate-900 rounded-2xl border border-slate-700/80 shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />
        
        {success ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-3xl font-bold animate-bounce shadow-sm">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="font-display font-black text-2xl text-white tracking-tight">Access Handshake Executed</h3>
            <p className="text-sm text-slate-400 font-mono">
              Opening localized workspace controls...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 mx-auto">
                {authMode === 'signin' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
              </div>
              <h2 className="text-2xl font-display font-black text-white tracking-tight">
                {authMode === 'signin' ? 'Contractor System Access' : 'Create Intelligence Account'}
              </h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {authMode === 'signin' 
                  ? 'Enter secure credentials via Firebase Auth' 
                  : 'Configure bespoke settings & securely onboard via standard Auth'}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorText(null); }}
                className={`flex-1 py-2 text-sm font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="h-3.5 w-3.5 inline mr-1" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorText(null); }}
                className={`flex-1 py-2 text-sm font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5 inline mr-1" />
                Sign Up
              </button>
            </div>

            {errorText && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg font-mono font-bold">
                {errorText}
              </div>
            )}

            <div className="space-y-1">
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-slate-900 border border-slate-600 hover:border-slate-400 hover:bg-slate-900/50 text-slate-200 font-display font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <Chrome className="h-4 w-4 text-blue-600 shrink-0" />}
                <span>Sign in with Google OAuth</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-700" />
              <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                or use credentials
              </span>
              <div className="flex-grow border-t border-slate-700" />
            </div>

            <div className="flex justify-center space-x-4 border-b border-slate-700 pb-3 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer font-mono font-bold text-slate-300">
                <input
                  type="radio"
                  name="channel_type"
                  checked={channel === 'email'}
                  onChange={() => { setChannel('email'); setOtpRequested(false); }}
                  className="h-3.5 w-3.5 accent-blue-600"
                />
                <span>Email </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer font-mono font-bold text-slate-300">
                <input
                  type="radio"
                  name="channel_type"
                  checked={channel === 'phone'}
                  onChange={() => { setChannel('phone'); setOtpRequested(false); }}
                  className="h-3.5 w-3.5 accent-blue-600"
                />
                <span>SMS</span>
              </label>
            </div>

            <form onSubmit={handleSubmitAuth} className="space-y-4">
              {channel === 'email' ? (
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-1.5 uppercase">
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
                      className="w-full bg-slate-900 border border-slate-700 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white transition-all font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-1.5 uppercase">
                      Mobile Dispatch Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        disabled={otpRequested}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="e.g. +1 512 555 0199"
                        className="w-full bg-slate-900 border border-slate-700 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white transition-all font-mono disabled:opacity-50"
                      />
                    </div>
                  </div>
                  {otpRequested && (
                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-1.5 uppercase">
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-slate-900 border border-slate-700 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white transition-all font-mono tracking-widest text-center"
                      />
                    </div>
                  )}
                </div>
              )}

              {channel === 'email' && (
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-1.5 uppercase">
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
                      className="w-full bg-slate-900 border border-slate-700 text-sm pl-11 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 shrink-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                  <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-widest border-b border-slate-700 pb-1.5">
                    Profile Setup
                  </span>

                  {channel === 'email' && (
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase">Confirm Password</label>
                      <input type="password" required value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} placeholder="Re-type security key" className="w-full bg-slate-800 border border-slate-700 text-sm px-3 py-2 rounded-lg focus:outline-none text-white font-mono" />
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase">Contractor Business Name</label>
                    <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Austin Air" className="w-full bg-slate-800 border border-slate-700 text-sm px-3 py-2 rounded-lg focus:outline-none text-white" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase">State</label>
                      <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full bg-slate-800 border-slate-700 text-sm p-2 rounded-lg text-white">
                        {StatesList.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase">City</label>
                      <select value={targetCity} onChange={(e) => setTargetCity(e.target.value)} className="w-full bg-slate-800 border-slate-700 text-sm p-2 rounded-lg text-white">
                        {StatesList.find(s => s.code === selectedState)?.cities.map(cityName => <option key={cityName} value={cityName}>{cityName}</option>) || <option value="">N/A</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase">Trade</label>
                      <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-slate-800 border-slate-700 text-sm p-2 rounded-lg text-white">
                        <option value="HVAC">HVAC</option>
                        <option value="Roofing">Roofing</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase">Membership Package</label>
                    <select value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value as any)} className="w-full bg-slate-800 border-slate-700 text-sm p-2 rounded-lg text-white">
                      <option value="Starter">Starter Plan</option>
                      <option value="Growth">Growth Plan</option>
                      <option value="Pro">Pro Plan</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Handling request...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>{
                      channel === 'phone' && !otpRequested 
                        ? 'Request SMS Pin' 
                        : authMode === 'signin' 
                          ? 'Verify Key & Enter' 
                          : 'Register Profile'
                    }</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

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
