import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, Sparkles, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: 'Starter' | 'Growth' | 'Pro';
  price: number;
  onPaymentSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  planName,
  price,
  onPaymentSuccess
}: CheckoutModalProps) {
  // Input fields
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  
  // UI States
  const [isFocusedOnCvc, setIsFocusedOnCvc] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
    setErrorMsg(null);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
    setErrorMsg(null);
  };

  // Format CVC (max 4 digits)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvc(value);
    setErrorMsg(null);
  };

  // Format ZIP (max 10 characters)
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    if (value.length > 10) value = value.slice(0, 10);
    setZip(value);
    setErrorMsg(null);
  };

  // Detect card brand automatically
  const detectBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'MasterCard';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Generic';
  };

  const cardBrand = detectBrand(cardNumber);

  // Validate inputs
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setErrorMsg('Please enter a valid card number.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMsg('Please enter a valid expiry date (MM/YY).');
      return;
    }
    const [month, year] = expiry.split('/').map(v => parseInt(v, 10));
    if (!month || month < 1 || month > 12) {
      setErrorMsg('Invalid expiry month.');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('Please enter a valid CVV/CVC code.');
      return;
    }
    if (!cardholder.trim()) {
      setErrorMsg('Please enter the name printed on the card.');
      return;
    }
    if (!zip.trim()) {
      setErrorMsg('Please specify your billing postal/zip code.');
      return;
    }

    setProcessing(true);

    // Simulate Payment Processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        // Reset states
        setSuccess(false);
        setCardholder('');
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setZip('');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 text-slate-200">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden relative"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
        
        {/* Success Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0.6, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-lg mb-6"
              >
                <Check className="h-10 w-10 stroke-[3px]" />
              </motion.div>
              <h3 className="text-2xl font-display font-extrabold text-white tracking-tight">Payment Approved!</h3>
              <p className="text-sm text-slate-400 font-mono mt-2">Transaction ID: TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p className="text-sm text-blue-400 font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 mt-4 rounded-full">
                Contractor Territory Locked
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <CreditCard className="h-5 w-5 text-blue-400" /> Secure Checkout
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Establish regional exclusivity and lock in weather triggers.
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Pricing Summary Widget */}
          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-widest">SELECTED MEMBERSHIP</span>
              <span className="text-sm font-display font-extrabold text-slate-100">{planName} Plan Exclusive</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">ACTIVE RATE</span>
              <span className="text-xl font-display font-black text-white block mt-0.5 font-mono">${price}<span className="text-sm text-slate-400 font-normal">/mo</span></span>
            </div>
          </div>

          {/* SENSORY CREDIT CARD PREVIEW */}
          <div className="perspective-1000">
            <div 
              className={`relative h-44 w-full rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-white p-5 flex flex-col justify-between shadow-xl border border-white/10 overflow-hidden transform-style-3d transition-all duration-700 ${
                isFocusedOnCvc ? 'rotate-y-180' : ''
              }`}
            >
              {/* Overlay Glassmorphism Pattern */}
              <div className="absolute inset-0 bg-slate-900/5 opacity-45 pointer-events-none saas-grid-bg" />
              
              {!isFocusedOnCvc ? (
                <>
                  {/* Front Face */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-bold text-slate-400">JobLeak Security Key</span>
                      <div className="h-7 w-9 bg-amber-400/80 rounded-md border border-white/10 shadow-inner relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-1 border border-amber-600/30 rounded" />
                        <div className="w-4 h-full bg-slate-950/10 border-l border-r border-amber-900/10" />
                      </div>
                    </div>
                    <span className="text-sm font-mono font-black tracking-widest bg-slate-900/10 px-2 py-1 rounded border border-white/15">
                      {cardBrand}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <p className="text-lg font-mono font-bold tracking-widest text-center text-slate-100">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <span className="text-[7px] uppercase font-mono tracking-wider font-extrabold text-slate-450 block">CARDHOLDER</span>
                      <p className="text-sm uppercase font-mono font-bold tracking-wider max-w-[170px] truncate">
                        {cardholder || 'YOUR FULL NAME'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] uppercase font-mono tracking-wider font-extrabold text-slate-450 block">EXPIRES</span>
                      <p className="text-sm font-mono font-bold">{expiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Back Face (CVC) */}
                  <div className="absolute top-6 left-0 right-0 h-9 bg-slate-800 z-10" />
                  <div className="mt-14 flex items-center justify-end gap-3 px-4 relative z-15">
                    <span className="text-[8px] uppercase font-mono font-semibold tracking-wider text-slate-400">SIGNATURE STRIP</span>
                    <div className="bg-slate-100 text-white font-mono italic font-bold text-sm px-2.5 py-1 rounded border border-slate-600 w-16 text-right rotate-y-180">
                      {cvc || '•••'}
                    </div>
                  </div>
                  <div className="text-right pr-4 pb-1 font-mono text-[8px] text-slate-400 uppercase tracking-widest leading-none rotate-y-180">
                    CVV Security Verification
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            
            {/* Cardholder Name */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                required
                value={cardholder}
                onChange={(e) => { setCardholder(e.target.value); setErrorMsg(null); }}
                placeholder="e.g. Michael J. Scott"
                className="w-full bg-slate-950/50 border border-slate-800 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-950 text-white font-sans"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-slate-950/50 border border-slate-800 text-sm pl-10 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-950 text-white font-mono"
                />
              </div>
            </div>

            {/* Nested Fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="w-full bg-slate-950/50 border border-slate-800 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-950 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  CVC / CVV
                </label>
                <input
                  type="password"
                  required
                  value={cvc}
                  onChange={handleCvcChange}
                  onFocus={() => setIsFocusedOnCvc(true)}
                  onBlur={() => setIsFocusedOnCvc(false)}
                  placeholder="•••"
                  className="w-full bg-slate-950/50 border border-slate-800 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-950 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Billing ZIP
                </label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={handleZipChange}
                  placeholder="78701"
                  className="w-full bg-slate-950/50 border border-slate-800 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-950 text-white font-mono text-center"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-sm p-3 rounded-xl font-mono font-bold text-center">
                {errorMsg}
              </div>
            )}

            {/* Stripe info disclosure */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-300 font-bold">Safe Simulator Mode</strong>: In production, Stripe is implemented on the backend (`STRIPE_SECRET_KEY`) proxying token sessions over SSL. This prevents client credentials from being exposed in browser logs.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Authorizing Settlement...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5 text-white shrink-0" />
                  <span>Verify Card & Finalize</span>
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
